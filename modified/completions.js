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
exports.Provider = void 0;
const vscode = require("vscode");
const decorToKind = (decor) => {
    switch (decor) {
        case ":bound":
            return vscode.CompletionItemKind.Variable;
        case ":data":
            return vscode.CompletionItemKind.Enum;
        case ":function":
            return vscode.CompletionItemKind.Function;
        case ":keyword":
            return vscode.CompletionItemKind.Keyword;
        case ":metavar":
            return vscode.CompletionItemKind.Variable;
        case ":module":
            return vscode.CompletionItemKind.Module;
        case ":type":
            return vscode.CompletionItemKind.TypeParameter;
    }
};

const commonModules = [
    "Prelude",
    "System",
    "Errno",
    "Concurrency",
    "Directory",
    "Escape",
    "Signal",
    "File",
    "Clock",
    "FFI",
    "Info",
    "REPL",
    "Maybe",
    "Fun",
    "String",
    "Bool",
    "IORef",
    "SnocList",
    "Singleton",
    "Colist1",
    "Contravariant",
    "So",
    "Vect",
    "List",
    "DPair",
    "Nat",
    "Morphisms",
    "Fin",
    "SortedSet",
    "Either",
    "Bits",
    "Bifoldable",
    "Ref",
    "Zippable",
    "List1",
    "Stream",
    "Colist",
    "Fuel",
    "Rel",
    "These",
    "Buffer",
    "IOArray",
    "SortedMap",
    "Maybe",
    "RWS",
    "ST",
    "Trans",
    "Writer",
    "Identity",
    "Either",
    "Reader",
    "State",
]

const addNamespace = (name) => {
    /** @type {string} */
    const n = name;
    // if (n.startsWith("String")) { return "Data." + n; }
    if (n.startsWith("Relation")) { return "Control.Relation"; } 
    if (n.startsWith("Function")) { return "Control.Function"; } 
    if (n.startsWith("Ord")) { return "Control.Ord"; } 
    if (n.startsWith("WellFounded")) { return "Control.WellFounded"; } 
    if (n.startsWith("App")) { return "Control.App"; } 
    if (n.startsWith("Order")) { return "Control.Order"; } 
    if (n.startsWith("PreorderReasoning")) { return "Syntax.PreorderReasoning"; } 
    if (n.startsWith("Errno")) { return "System.Errno"; } 
    if (n.startsWith("Concurrency")) { return "System.Concurrency"; } 
    if (n.startsWith("Directory")) { return "System.Directory"; } 
    if (n.startsWith("Escape")) { return "System.Escape"; } 
    if (n.startsWith("Signal")) { return "System.Signal"; } 
    if (n.startsWith("File")) { return "System.File"; } 
    if (n.startsWith("Clock")) { return "System.Clock"; } 
    if (n.startsWith("FFI")) { return "System.FFI"; } 
    if (n.startsWith("Info")) { return "System.Info"; } 
    if (n.startsWith("REPL")) { return "System.REPL"; } 
    if (n.startsWith("Reflection")) { return "Language.Reflection"; } 
    if (n.startsWith("Equality")) { return "Decidable.Equality"; } 
    if (n.startsWith("Decidable")) { return "Decidable.Decidable"; } 
    if (n.startsWith("Functor")) { return "Deriving.Functor"; } 
    if (n.startsWith("Foldable")) { return "Deriving.Foldable"; } 
    if (n.startsWith("Traversable")) { return "Deriving.Traversable"; } 
    if (n.startsWith("Common")) { return "Deriving.Common"; } 
    if (n.startsWith("Show")) { return "Deriving.Show"; } 
    if (n.startsWith("Trace")) { return "Debug.Trace"; } 
    if (n.startsWith("Maybe")) { return "Data.Maybe"; } 
    if (n.startsWith("Fun")) { return "Data.Fun"; } 
    if (n.startsWith("String")) { return "Data.String"; } 
    if (n.startsWith("Bool")) { return "Data.Bool"; } 
    if (n.startsWith("IORef")) { return "Data.IORef"; } 
    if (n.startsWith("SnocList")) { return "Data.SnocList"; } 
    if (n.startsWith("Singleton")) { return "Data.Singleton"; } 
    if (n.startsWith("Colist1")) { return "Data.Colist1"; } 
    if (n.startsWith("Contravariant")) { return "Data.Contravariant"; } 
    if (n.startsWith("So")) { return "Data.So"; } 
    if (n.startsWith("Vect")) { return "Data.Vect"; } 
    if (n.startsWith("List")) { return "Data.List"; } 
    if (n.startsWith("DPair")) { return "Data.DPair"; } 
    if (n.startsWith("Nat")) { return "Data.Nat"; } 
    if (n.startsWith("Morphisms")) { return "Data.Morphisms"; } 
    if (n.startsWith("Fin")) { return "Data.Fin"; } 
    if (n.startsWith("SortedSet")) { return "Data.SortedSet"; } 
    if (n.startsWith("Either")) { return "Data.Either"; } 
    if (n.startsWith("Bits")) { return "Data.Bits"; } 
    if (n.startsWith("Bifoldable")) { return "Data.Bifoldable"; } 
    if (n.startsWith("Ref")) { return "Data.Ref"; } 
    if (n.startsWith("Zippable")) { return "Data.Zippable"; } 
    if (n.startsWith("List1")) { return "Data.List1"; } 
    if (n.startsWith("Stream")) { return "Data.Stream"; } 
    if (n.startsWith("Colist")) { return "Data.Colist"; } 
    if (n.startsWith("Fuel")) { return "Data.Fuel"; } 
    if (n.startsWith("Rel")) { return "Data.Rel"; } 
    if (n.startsWith("These")) { return "Data.These"; } 
    if (n.startsWith("Buffer")) { return "Data.Buffer"; } 
    if (n.startsWith("IOArray")) { return "Data.IOArray"; } 
    if (n.startsWith("SortedMap")) { return "Data.SortedMap"; } 
    if (n.startsWith("Const")) { return "Control.Applicative.Const"; } 
    if (n.startsWith("FileIO")) { return "Control.App.FileIO"; } 
    if (n.startsWith("Console")) { return "Control.App.Console"; } 
    if (n.startsWith("Maybe")) { return "Control.Monad.Maybe"; } 
    if (n.startsWith("RWS")) { return "Control.Monad.RWS"; } 
    if (n.startsWith("ST")) { return "Control.Monad.ST"; } 
    if (n.startsWith("Trans")) { return "Control.Monad.Trans"; } 
    if (n.startsWith("Writer")) { return "Control.Monad.Writer"; } 
    if (n.startsWith("Identity")) { return "Control.Monad.Identity"; } 
    if (n.startsWith("Either")) { return "Control.Monad.Either"; } 
    if (n.startsWith("Reader")) { return "Control.Monad.Reader"; } 
    if (n.startsWith("State")) { return "Control.Monad.State"; } 
    if (n.startsWith("FunExt")) { return "Control.Function.FunExt"; } 
    if (n.startsWith("Generic")) { return "Syntax.PreorderReasoning.Generic"; } 
    if (n.startsWith("Handle")) { return "System.File.Handle"; } 
    if (n.startsWith("Types")) { return "System.File.Types"; } 
    if (n.startsWith("Mode")) { return "System.File.Mode"; } 
    if (n.startsWith("ReadWrite")) { return "System.File.ReadWrite"; } 
    if (n.startsWith("Meta")) { return "System.File.Meta"; } 
    if (n.startsWith("Support")) { return "System.File.Support"; } 
    if (n.startsWith("Permissions")) { return "System.File.Permissions"; } 
    if (n.startsWith("Virtual")) { return "System.File.Virtual"; } 
    if (n.startsWith("Process")) { return "System.File.Process"; } 
    if (n.startsWith("Buffer")) { return "System.File.Buffer"; } 
    if (n.startsWith("Error")) { return "System.File.Error"; } 
    if (n.startsWith("TT")) { return "Language.Reflection.TT"; } 
    if (n.startsWith("TTImp")) { return "Language.Reflection.TTImp"; } 
    if (n.startsWith("Core")) { return "Decidable.Equality.Core"; } 
    if (n.startsWith("Order")) { return "Data.Fin.Order"; } 
    if (n.startsWith("Quantifiers")) { return "Data.List1.Quantifiers"; } 
    if (n.startsWith("Elem")) { return "Data.List1.Elem"; } 
    if (n.startsWith("Properties")) { return "Data.List1.Properties"; } 
    if (n.startsWith("Views")) { return "Data.Primitives.Views"; } 
    if (n.startsWith("Views")) { return "Data.Nat.Views"; } 
    if (n.startsWith("Order")) { return "Data.Nat.Order"; } 
    if (n.startsWith("HasLength")) { return "Data.List.HasLength"; } 
    if (n.startsWith("Quantifiers")) { return "Data.List.Quantifiers"; } 
    if (n.startsWith("Views")) { return "Data.List.Views"; } 
    if (n.startsWith("Elem")) { return "Data.List.Elem"; } 
    if (n.startsWith("Quantifiers")) { return "Data.SnocList.Quantifiers"; } 
    if (n.startsWith("Operations")) { return "Data.SnocList.Operations"; } 
    if (n.startsWith("Elem")) { return "Data.SnocList.Elem"; } 
    if (n.startsWith("AtIndex")) { return "Data.Vect.AtIndex"; } 
    if (n.startsWith("Quantifiers")) { return "Data.Vect.Quantifiers"; } 
    if (n.startsWith("Elem")) { return "Data.Vect.Elem"; } 
    if (n.startsWith("Dependent")) { return "Data.SortedMap.Dependent"; } 
    if (n.startsWith("Xor")) { return "Data.Bool.Xor"; } 
    if (n.startsWith("Prims")) { return "Data.IOArray.Prims"; } 
    if (n.startsWith("Interface")) { return "Control.Monad.State.Interface"; } 
    if (n.startsWith("State")) { return "Control.Monad.State.State"; } 
    if (n.startsWith("Interface")) { return "Control.Monad.RWS.Interface"; } 
    if (n.startsWith("CPS")) { return "Control.Monad.RWS.CPS"; } 
    if (n.startsWith("Interface")) { return "Control.Monad.Error.Interface"; } 
    if (n.startsWith("Either")) { return "Control.Monad.Error.Either"; } 
    if (n.startsWith("Interface")) { return "Control.Monad.Writer.Interface"; } 
    if (n.startsWith("CPS")) { return "Control.Monad.Writer.CPS"; } 
    if (n.startsWith("Interface")) { return "Control.Monad.Reader.Interface"; } 
    if (n.startsWith("Reader")) { return "Control.Monad.Reader.Reader"; } 
    return n;
};

const getCompletions = (name) => {
    /** @type {string} */
    const n = name;
    if (n.startsWith("String.")) {
        const options = ["words", "lines"]
        const completions = options.map((completion) => new vscode.CompletionItem("String." + completion, vscode.CompletionItemKind.Function));
        return res(completions);
    }
    return n;
};

const getPrefix = (name) => {
    const prefix = name.substring(0,name.lastIndexOf('.'))
    return prefix;
};

class Provider {
    constructor(client) {
        this.client = client;
    }
    provideCompletionItems(document, position, _token, _context) {
        const range = document.getWordRangeAtPosition(position);
        /** @type {string} */
        const name = document.getText(range);
        return new Promise((res) => __awaiter(this, void 0, void 0, function* () {
            // prevent resource hogging
            if (name.includes("\n")) {return res([]);}

            if (name.includes(".")) {
                const prefix = getPrefix(name);
                const nameWithNs = addNamespace(prefix);
                // console.log(`ns: ${nameWithNs}`);
                const id = ++this.client.reqCounter;
                const req = {
                    id,
                    namespace: nameWithNs,
                    type: ":browse-namespace",
                };
                const browsereply = yield this.client.makeReq(req).then((r) => r);
                const declarations = browsereply.declarations;
                const declObjs = 
                    declarations.map((x) => 
                        [x.substring(0, x.indexOf(' ')), x.substring(x.indexOf(' ') + 1)]
                    )
                // console.log(JSON.stringify(declarationNames));
                const completions = declObjs.map((completion) => 
                    new vscode.CompletionItem(
                        {
                            label: prefix + '.' + completion[0],
                            detail: completion[1],
                            description: "",
                        }, 
                        vscode.CompletionItemKind.Function));
                return res(completions);
            }

            const reply = yield this.client.replCompletions(name);
      
            // sometimes does not return an array
            if (Array.isArray(reply.completions)) {
                const modules = commonModules.map((completion) => new vscode.CompletionItem(completion, vscode.CompletionItemKind.Module));
                const completions = reply.completions.map((completion) => new vscode.CompletionItem(completion, vscode.CompletionItemKind.Function));
                res(completions.concat(modules));    
            }
            else {
                res([]);
            }
            
        }));
    }
    resolveCompletionItem(item, _token) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const reply = yield this.client.docsFor(item.label, ":overview");
            if (reply.ok) {
                item.documentation = reply.docs;
                // The first line of the docs is the identifier itself, so the first
                // item of metadata is the type.
                const decor = ((_b = (_a = reply.metadata[0]) === null || _a === void 0 ? void 0 : _a.metadata) === null || _b === void 0 ? void 0 : _b.decor) || ":function";
                item.kind = decorToKind(decor);
            }
            resolve(item);
        }));
    }
}
exports.Provider = Provider;
//# sourceMappingURL=completions.js.map
