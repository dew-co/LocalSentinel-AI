import * as vscode from "vscode";

const API_BASE = "http://localhost:8000";

export function activate(context: vscode.ExtensionContext) {
  const openAssistant = vscode.commands.registerCommand("localsentinel.openAssistant", async () => {
    vscode.window.showInformationMessage(`LocalSentinel AI backend target: ${API_BASE}`);
  });

  const placeholder = (name: string) =>
    vscode.commands.registerCommand(name, async () => {
      vscode.window.showInformationMessage("LocalSentinel AI VS Code integration is prepared for a future implementation.");
    });

  context.subscriptions.push(
    openAssistant,
    placeholder("localsentinel.explainCurrentFile"),
    placeholder("localsentinel.generateFixPlan"),
    placeholder("localsentinel.sendSelection"),
    placeholder("localsentinel.analyzeProject")
  );
}

export function deactivate() {}

