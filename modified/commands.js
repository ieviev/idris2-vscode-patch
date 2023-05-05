"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = exports.typeOf = exports.typeAt = exports.proofSearch = exports.makeWith = exports.makeLemma = exports.makeCase = exports.loadFile = exports.printDefinitionSelection = exports.printDefinition = exports.interpretSelection = exports.evalResult = exports.metavariables = exports.generateDef = exports.docsForSelection = exports.docsFor = exports.caseSplit = exports.browseNamespace = exports.aproposSelection = exports.apropos = exports.addMissing = exports.addClause = exports.v2Only = void 0;
const vscode = require("vscode");
const editing_1 = require("./editing");
const message_stitching_1 = require("./message-stitching");
const state_1 = require("./state");
const languages_1 = require("./languages");
const fs = require("fs");
/**
 * Many of the calls that accept the name of a metavariable don’t expect the
 * name to begin with the leading ?, so it has to be removed first.
 */
const trimMeta = (name) => (name.startsWith("?") ? name.slice(1, name.length) : name);
const status = (msg) => vscode.window.setStatusBarMessage(msg, 2000);
const v2Only = (actionName) => {
    vscode.window.showWarningMessage(actionName + " is only available in Idris 2.");
    return;
};
exports.v2Only = v2Only;
const autosave = (doc) => __awaiter(void 0, void 0, void 0, function* () {
    if (doc.isDirty) {
        switch (state_1.state.autosave) {
            case "always": {
                const saved = yield doc.save();
                if (!saved)
                    vscode.window.showErrorMessage("Failed to save file.");
                break;
            }
            case "never":
                break;
            case "prompt":
                const shouldSave = yield vscode.window.showQuickPick(["Save", "Cancel"]);
                if (shouldSave === "Save") {
                    const saved = yield doc.save();
                    if (!saved)
                        vscode.window.showErrorMessage("Failed to save file.");
                }
                break;
        }
    }
});
const ensureLoaded = (client) => new Promise((res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const doc = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document;
    if (doc) {
        yield autosave(doc);
        if (doc && doc.fileName !== state_1.state.currentFile) {
            return res(exports.loadFile(client, doc));
        }
    }
    res();
}));
const addClause = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const selection = editing_1.currentWord();
    if (selection) {
        const { name, line } = selection;
        yield ensureLoaded(client);
        const reply = yield client.addClause(name, line + 1);
        if (reply.ok) {
            const insertAt = editing_1.lineAfterDecl(line);
            editing_1.insertLine(reply.initialClause, insertAt);
        }
    }
});
exports.addClause = addClause;
/**
 * If you call addMissing on a case statement, it works, but is prefaced with
 * some unwanted text (but with correct indentation), e.g.:
 * "                 case block in one at /home/michael/dev/idris-scratch/temp.idr:6:18-22 _ (S k) = ?Z_rhs_1"
 * This function keeps the indent and the statement, but crops out the other text.
 * Also, it uses = instead of =>, I guess it doesn’t know it’s in a case statement.
 * Also, if you call it on the existing metavariable, it will add an additional ?
 */
const parseCaseBlockStmt = (replyText) => {
    const regex = /(\s+)case block in \w+ at .*? _ (.*?)$/;
    const match = regex.exec(replyText);
    if (match) {
        const [_, indent, stmt] = match;
        const fixed = stmt.replace("=", "=>").replace("??", "?");
        return indent + fixed;
    }
    else
        return replyText;
};
const addMissing = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const selection = editing_1.currentWord();
    if (selection) {
        const { name, line } = selection;
        yield ensureLoaded(client);
        const reply = yield client.addMissing(name, line + 1);
        if (reply.ok) {
            const insertAt = editing_1.lineAfterDecl(line);
            editing_1.insertLine(parseCaseBlockStmt(reply.missingClauses), insertAt);
        }
    }
});
exports.addMissing = addMissing;
const displayApropos = (client, input) => __awaiter(void 0, void 0, void 0, function* () {
    status("Searching for documentation that includes " + input + "...");
    const reply = yield client.apropos(input);
    if (reply.ok) {
        state_1.state.virtualDocState[reply.id] = {
            text: reply.docs,
            metadata: reply.metadata || [],
        };
        const uri = vscode.Uri.parse("idris:" + reply.id);
        const doc = yield vscode.workspace.openTextDocument(uri);
        yield vscode.window.showTextDocument(doc);
    }
    else {
        status("No results found for " + input + ".");
    }
});
const apropos = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = "Search documentation for all references to:";
    const input = yield vscode.window.showInputBox({ prompt });
    if (input)
        displayApropos(client, input);
});
exports.apropos = apropos;
const aproposSelection = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const selection = editing_1.currentWord();
    if (selection)
        displayApropos(client, selection.name);
});
exports.aproposSelection = aproposSelection;
const browseNamespace = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = "Show contents of namespace:";
    const input = yield vscode.window.showInputBox({ prompt });
    status("Searching for contents of " + input + "...");
    if (input) {
        const reply = yield client.browseNamespace(input);
        if (reply.ok) {
            const docInfo = message_stitching_1.stitchBrowseNamespace(reply.subModules, reply.declarations);
            state_1.state.virtualDocState[reply.id] = docInfo;
            const uri = vscode.Uri.parse("idris:" + reply.id);
            const doc = yield vscode.workspace.openTextDocument(uri);
            yield vscode.window.showTextDocument(doc);
        }
        else {
            status("No results found for " + input + ".");
        }
    }
});
exports.browseNamespace = browseNamespace;
const caseSplit = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const selection = editing_1.currentWord();
    if (selection) {
        const { name, line } = selection;
        yield ensureLoaded(client);
        const reply = yield client.caseSplit(name, line + 1);
        if (reply.ok) {
            const caseStmt = reply.caseClause.trim();
            if (caseStmt) {
                // The reply doesn’t preserve indentation, so if we’re replacing the
                // whole line, we want to first re-add the original indentation. Adding
                // the padding to the first line is enough, the second line is magically
                // kept aligned.
                const indentation = editing_1.getIndent(line);
                editing_1.replaceLine(indentation + caseStmt, line);
            }
        }
        else {
            status(name + " cannot be case-split.");
        }
    }
});
exports.caseSplit = caseSplit;
const displayDocsFor = (client, input) => __awaiter(void 0, void 0, void 0, function* () {
    status("Getting documentation for " + input + "...");
    const reply = yield client.docsFor(input, ":full");
    if (reply.ok) {
        state_1.state.virtualDocState[reply.id] = {
            text: reply.docs,
            metadata: reply.metadata,
        };
        const uri = vscode.Uri.parse("idris:" + reply.id);
        const doc = yield vscode.workspace.openTextDocument(uri);
        yield vscode.window.showTextDocument(doc);
    }
    else {
        status("No results found for " + input + ".");
    }
});
const docsFor = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = "Show documentation for: ";
    const input = yield vscode.window.showInputBox({ prompt });
    if (input)
        displayDocsFor(client, input);
});
exports.docsFor = docsFor;
const docsForSelection = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const selection = editing_1.currentWord();
    if (selection)
        displayDocsFor(client, selection.name);
});
exports.docsForSelection = docsForSelection;
const generateDef = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    if (!state_1.state.idris2Mode)
        return exports.v2Only("Generate Definition");
    const selection = editing_1.currentWord();
    if (selection) {
        const { name, line } = selection;
        yield ensureLoaded(client);
        const reply = yield client.generateDef(name, line + 1);
        if (reply.ok) {
            const insertAt = editing_1.lineAfterDecl(line);
            editing_1.insertLine(reply.def, insertAt);
        }
    }
});
exports.generateDef = generateDef;
const metavariables = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    yield ensureLoaded(client);
    const reply = yield client.metavariables(80);
    const docInfo = message_stitching_1.stitchMetavariables(reply.metavariables);
    state_1.state.virtualDocState[reply.id] = docInfo;
    const uri = vscode.Uri.parse("idris:" + reply.id);
    const doc = yield vscode.workspace.openTextDocument(uri);
    yield vscode.window.showTextDocument(doc);
});
exports.metavariables = metavariables;
exports.evalResult = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
});
const interpretSelection = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const selection = editing_1.currentSelection();
    if (selection) {
        const { name, range } = selection;
        yield ensureLoaded(client);
        const reply = yield client.interpret(name);
        if (reply.ok) {
            const opts = {
                hoverMessage: { language: "idris", value: reply.result },
                range,
                renderOptions: {
                    after: {
                        color: new vscode.ThemeColor("editorCursor.foreground"),
                        contentText: " => " + reply.result,
                        fontStyle: "italic",
                    },
                },
            };
            (_b = vscode.window.activeTextEditor) === null || _b === void 0 ? void 0 : _b.setDecorations(exports.evalResult, [opts]);
        }
        else {
            status("Could not evaluate " + name + ".");
        }
    }
});
exports.interpretSelection = interpretSelection;
const displayPrintDefinition = (client, input) => __awaiter(void 0, void 0, void 0, function* () {
    status("Getting definition for " + input + "...");
    yield ensureLoaded(client);
    const reply = yield client.printDefinition(input);
    if (reply.ok) {
        state_1.state.virtualDocState[reply.id] = {
            text: reply.definition,
            metadata: reply.metadata || [],
        };
        const uri = vscode.Uri.parse("idris:" + reply.id);
        const doc = yield vscode.workspace.openTextDocument(uri);
        yield vscode.window.showTextDocument(doc);
    }
    else {
        status("No results found for " + input + ".");
    }
});
const printDefinition = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const prompt = "Show definition for: ";
    const input = yield vscode.window.showInputBox({ prompt });
    if (input)
        displayPrintDefinition(client, input);
});
exports.printDefinition = printDefinition;
const printDefinitionSelection = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const selection = editing_1.currentWord();
    if (selection)
        displayPrintDefinition(client, selection.name);
});
exports.printDefinitionSelection = printDefinitionSelection;



const loadFile = (client, document) => __awaiter(void 0, void 0, void 0, function* () {
    if (state_1.state.statusMessage)
        state_1.state.statusMessage.dispose();
    if (languages_1.isExtLanguage(document.languageId) && state_1.supportedLanguages(state_1.state).includes(document.languageId)) {
        // replace backslashes for windows support
        var file = document.fileName.replace(/\\/g, "/");
        const reply = yield client.loadFile(`${file}`);
        if (reply.ok) {
            state_1.state.currentFile = document.fileName;
        }
        else if (state_1.state.idris2Mode) {
            state_1.state.statusMessage = vscode.window.setStatusBarMessage("File failed to typecheck — commands will work incorrectly until it does.");
        }
        else {
            status("Failed to load file.");
        }
    }
});
exports.loadFile = loadFile;
// Some lidr replies have duplicated `> `s, mixed up with whitespace. Sigh.
// See https://github.com/meraymond2/idris-ide-client/blob/main/test/client/v2-lidr.test.ts
// for examples of the malformed resposnes.
// TODO: This works, but I think it can be simplified considerably, and could use units tests.
const fixLidrPrefix = (s) => {
    if (s.startsWith("> > ")) {
        const fixed = s.replace(/^(> )+/, "");
        const indentDiff = s.length - fixed.length;
        return s
            .split("\n")
            .map((line) => {
            const sliced = line.slice(indentDiff, line.length);
            const extraArrows = sliced.match(/^(> )+/);
            if (extraArrows) {
                const [matched] = extraArrows;
                return "> " + " ".repeat(matched.length) + sliced.slice(matched.length, sliced.length);
            }
            else {
                return "> " + sliced;
            }
        })
            .join("\n");
    }
    else
        return s;
};
const makeCase = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const selection = editing_1.currentWord();
    if (selection) {
        const { name, line } = selection;
        ensureLoaded(client);
        const reply = yield client.makeCase(trimMeta(name), line + 1);
        const caseStmt = fixLidrPrefix(reply.caseClause.trim());
        if (caseStmt) {
            // The reply doesn’t preserve indentation, so if we’re replacing the whole
            // line, we want to first re-add the original indentation. Adding the
            // padding to the first line is enough, the second line is magically kept
            // aligned.
            const indentation = editing_1.getIndent(line);
            editing_1.replaceLine(indentation + caseStmt, line);
        }
        else {
            status("Failed to add a case statement for " + name + ".");
        }
    }
});
exports.makeCase = makeCase;
const makeLemma = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const selection = editing_1.currentWord();
    if (selection) {
        const { name, line } = selection;
        yield ensureLoaded(client);
        const reply = yield client.makeLemma(trimMeta(name), line + 1);
        if (reply.ok) {
            const editor = vscode.window.activeTextEditor;
            editor === null || editor === void 0 ? void 0 : editor.edit((eb) => {
                // when making multiple changes, they need to use the same edit-builder
                const docLang = editor.document.languageId;
                const declPos = new vscode.Position(editing_1.prevEmptyLine(line, docLang), 0);
                const newline = docLang === "lidr" ? "> \n" : "\n";
                eb.insert(declPos, newline + reply.declaration + "\n");
                eb.replace(selection.range, reply.metavariable);
            });
        }
        else {
            status("Failed to make a lemma for " + name + ".");
        }
    }
});
exports.makeLemma = makeLemma;
const makeWith = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const selection = editing_1.currentWord();
    if (selection) {
        const { name, line } = selection;
        yield ensureLoaded(client);
        const reply = yield client.makeWith(name, line + 1);
        editing_1.replaceLine(fixLidrPrefix(reply.withClause.trim()), line);
    }
});
exports.makeWith = makeWith;
const proofSearch = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const selection = editing_1.currentWord();
    if (selection) {
        const { name, line } = selection;
        status("Solving for " + name + "...");
        yield ensureLoaded(client);
        const reply = yield client.proofSearch(trimMeta(name), line + 1, []);
        if (reply.ok && reply.solution !== name) {
            editing_1.replaceRange(reply.solution, selection.range);
        }
        else {
            status("Could not find a solution for " + name + ".");
        }
    }
});


exports.proofSearch = proofSearch;
const typeAt = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    if (!state_1.state.idris2Mode)
        return exports.v2Only("Type At");
    const selection = editing_1.currentWord();
    if (selection) {
        const { name, line, range } = selection;
        const trimmed = name.startsWith("?") ? name.slice(1, name.length) : name;
        yield ensureLoaded(client);
        const reply = yield client.typeAt(trimmed, line + 1, range.start.character);
        if (reply.ok) {
            state_1.state.outputChannel.clear();
            state_1.state.outputChannel.append(reply.typeAt);
            state_1.state.outputChannel.show(true);
        }
    }
});
exports.typeAt = typeAt;
const typeOf = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const selection = editing_1.currentWord();
    if (selection) {
        const { name } = selection;
        const trimmed = name.startsWith("?") ? name.slice(1, name.length) : name;
        yield ensureLoaded(client);
        const reply = yield client.typeOf(trimmed);
        if (reply.ok) {
            state_1.state.outputChannel.clear();
            state_1.state.outputChannel.append(reply.typeOf);
            state_1.state.outputChannel.show(true);
        }
    }
});
exports.typeOf = typeOf;
const version = (client) => () => __awaiter(void 0, void 0, void 0, function* () {
    const { major, minor, patch, tags } = yield client.version();
    const nonEmptyTags = tags.filter(Boolean);
    const msg = "Idris version is " + major + "." + minor + "." + patch + (nonEmptyTags.length ? "-" + nonEmptyTags.join("-") : "");
    vscode.window.showInformationMessage(msg);
});
exports.version = version;
//# sourceMappingURL=commands.js.map