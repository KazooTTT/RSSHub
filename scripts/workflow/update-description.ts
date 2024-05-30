import fs from 'node:fs';
import path from 'path';
import { filePathToDescription } from '../../lib/registry';
import { getCurrentPath } from '../../lib/utils/helpers';
import ts from 'typescript';

const __dirname = getCurrentPath(import.meta.url);

// Function to replace blank lines with comments and revert back after transformation
const processBlankLines = (content, revert = false) => {
    const placeholder = '// blank line';
    if (revert) {
        return content.replaceAll(new RegExp(placeholder, 'g'), '');
    }
    return content.replaceAll(/^\s*$(?:\r\n?|\n)/gm, placeholder + '\n');
};
const descriptionTagStart = '<description>';
const descriptionTagEnd = '</description>';

// Function to process unicode in the description
const processDescriptionUnicode = (content: string) => {
    const descriptionTagStart = '<description>';
    const descriptionTagEnd = '</description>';

    const startIndex = content.indexOf(descriptionTagStart);
    const endIndex = content.indexOf(descriptionTagEnd, startIndex);

    if (startIndex === -1 || endIndex === -1) {
        return content;
    }

    const beforeDescription = content.slice(0, startIndex);
    const afterDescription = content.slice(endIndex + descriptionTagEnd.length);
    let descriptionContent = content.slice(startIndex + descriptionTagStart.length, endIndex);

    // Process unicode characters in the description content
    descriptionContent = unescape(descriptionContent.replaceAll(String.raw`\u`, '%u'));

    return beforeDescription + descriptionContent + afterDescription;
};

// Process each imported module
for (const filePath in filePathToDescription) {
    if (/^\/[ab]/.test(filePath)) {
        // Handle file paths that start with a digit
        const description = filePathToDescription[filePath];

        // Trim whitespace from the beginning of each line
        const newDescriptionList = description.split('\n').map((line) => line.trimStart());
        const newDescription = newDescriptionList.join('<newline>');

        if (description !== newDescription) {
            // Compute the target file path
            const targetPath = path.join(__dirname, '../../lib/routes', filePath);
            // Read the source file content
            const sourceFile = fs.readFileSync(targetPath, 'utf-8');

            // Replace blank lines with comments
            const processedSourceFile = processBlankLines(sourceFile);

            // Create TypeScript source file
            const sourceFileAST = ts.createSourceFile(targetPath, processedSourceFile, ts.ScriptTarget.Latest, true);

            // Create printer
            const printer = ts.createPrinter();

            // AST transformer to modify the description field
            // AST transformer to modify the description field in route or namespace variables
            const transformer = (context) => {
                const visit = (node) => {
                    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && (node.name.text === 'route' || node.name.text === 'namespace') && ts.isObjectLiteralExpression(node.initializer)) {
                        const properties = node.initializer.properties;
                        for (const property of properties) {
                            if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) && property.name.text === 'description' && ts.isNoSubstitutionTemplateLiteral(property.initializer)) {
                                const finalNewDescription = descriptionTagStart + newDescription + descriptionTagEnd;
                                const newInitializer = ts.factory.createNoSubstitutionTemplateLiteral(finalNewDescription);
                                property.initializer = newInitializer;
                            }
                        }
                    }
                    return ts.visitEachChild(node, visit, context);
                };
                return (node) => ts.visitNode(node, visit);
            };

            const result = ts.transform(sourceFileAST, [transformer]);
            const transformedSourceFile = result.transformed[0];
            let newSourceFileContent = printer.printFile(transformedSourceFile);

            // Revert comments back to blank lines
            newSourceFileContent = processBlankLines(newSourceFileContent, true);
            newSourceFileContent = processDescriptionUnicode(newSourceFileContent);
            newSourceFileContent = newSourceFileContent.replaceAll(`<newline>`, '\n');

            // Write the modified content back to the file
            fs.writeFileSync(targetPath, Buffer.from(newSourceFileContent, 'utf-8'));
        }
    }
}
