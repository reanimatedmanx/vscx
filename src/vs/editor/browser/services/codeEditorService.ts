/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import { Event } from 'vs/base/common/event';
import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IDecorationRenderOptions } from 'vs/editor/common/editorCommon';
import { IModelDecorationOptions, ITextModel } from 'vs/editor/common/model';
import { ICodeEditor, IDiffEditor, isCodeEditor, isDiffEditor } from 'vs/editor/browser/editorBrowser';
import { IResourceInput } from 'vs/platform/editor/common/editor';
import { TPromise } from 'vs/base/common/winjs.base';

export const ICodeEditorService = createDecorator<ICodeEditorService>('codeEditorService');

export interface ICodeEditorService {
	_serviceBrand: any;

	onCodeEditorAdd: Event<ICodeEditor>;
	onCodeEditorRemove: Event<ICodeEditor>;

	onDiffEditorAdd: Event<IDiffEditor>;
	onDiffEditorRemove: Event<IDiffEditor>;

	addCodeEditor(editor: ICodeEditor): void;
	removeCodeEditor(editor: ICodeEditor): void;
	listCodeEditors(): ICodeEditor[];

	addDiffEditor(editor: IDiffEditor): void;
	removeDiffEditor(editor: IDiffEditor): void;
	listDiffEditors(): IDiffEditor[];

	/**
	 * Returns the current focused code editor (if the focus is in the editor or in an editor widget) or null.
	 */
	getFocusedCodeEditor(): ICodeEditor;

	registerDecorationType(key: string, options: IDecorationRenderOptions, parentTypeKey?: string): void;
	removeDecorationType(key: string): void;
	resolveDecorationOptions(typeKey: string, writable: boolean): IModelDecorationOptions;

	setTransientModelProperty(model: ITextModel, key: string, value: any): void;
	getTransientModelProperty(model: ITextModel, key: string): any;

	getActiveCodeEditor(): ICodeEditor;
	openCodeEditor(input: IResourceInput, source: ICodeEditor, sideBySide?: boolean): TPromise<ICodeEditor>;
}

/**
 * Uses `editor.getControl()` and returns either a `codeEditor` or a `diffEditor` or nothing.
 */
export function getCodeOrDiffEditor(editor: { getControl: () => any }): { codeEditor: ICodeEditor; diffEditor: IDiffEditor } {
	if (editor) {
		let control = editor.getControl();
		if (control) {
			if (isCodeEditor(control)) {
				return {
					codeEditor: control,
					diffEditor: null
				};
			}
			if (isDiffEditor(control)) {
				return {
					codeEditor: null,
					diffEditor: control
				};
			}
		}
	}

	return {
		codeEditor: null,
		diffEditor: null
	};
}

/**
 * Uses `editor.getControl()` and returns either the code editor, or the modified editor of a diff editor or nothing.
 */
export function getCodeEditor(editor: { getControl: () => any }): ICodeEditor {
	let r = getCodeOrDiffEditor(editor);
	return r.codeEditor || (r.diffEditor && <ICodeEditor>r.diffEditor.getModifiedEditor()) || null;
}
