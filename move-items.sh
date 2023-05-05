#!/bin/bash
cp -v ./modified/completions.js "$HOME/.vscode/extensions/meraymond.idris-vscode-0.0.14/out/providers/completions.js" 
cp -v ./modified/commands.js "$HOME/.vscode/extensions/meraymond.idris-vscode-0.0.14/out/commands.js" 
cp -v ./modified/reply-parser.js "$HOME/.vscode/extensions/meraymond.idris-vscode-0.0.14/node_modules/idris-ide-client/build/parser/reply-parser.js"

