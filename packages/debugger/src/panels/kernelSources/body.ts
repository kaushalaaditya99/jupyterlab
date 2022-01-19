// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import { openKernelSourceIcon } from '../../icons';

import { ReactWidget, ToolbarButton } from '@jupyterlab/ui-components';

import { Signal } from '@lumino/signaling';

import { PanelLayout, Widget } from '@lumino/widgets';

import { KernelSourcesFilter } from './search';

import { EditorHandler } from '../../handlers/editor';

import { IDebugger } from '../../tokens';

/**
 * The class name added to the filebrowser filterbox node.
 */
const FILTERBOX_CLASS = 'jp-DebuggerKernelSource-filterBox';

/**
 * The body for a Sources Panel.
 */
export class KernelSourcesBody extends Widget {
  /**
   * Instantiate a new Body for the KernelSourcesBody widget.
   *
   * @param options The instantiation options for a KernelSourcesBody.
   */
  constructor(options: KernelSourcesBody.IOptions) {
    super();
    this._model = options.model;
    this._debuggerService = options.service;

    this.layout = new PanelLayout();
    this.addClass('jp-DebuggerKernelSources-body');

    this._filenameSearcher = KernelSourcesFilter({
      model: this._model,
      filter: ''
    });
    this._filenameSearcher.addClass(FILTERBOX_CLASS);

    (this.layout as PanelLayout).addWidget(this._filenameSearcher);

    this._model.changed.connect((_, kernelSources) => {
      this._clear();
      if (kernelSources) {
        kernelSources.forEach(module => {
          const name = module.name;
          const path = module.path;
          const button = new ToolbarButton({
            icon: openKernelSourceIcon,
            label: name,
            tooltip: path
          });
          button.node.addEventListener('dblclick', () => {
            this._debuggerService
              .getSource({
                sourceReference: 0,
                path: path
              })
              .then(source => {
                this._model.open(source);
              });
          });
          (this.layout as PanelLayout).addWidget(button);
        });
      }
    });
  }

  set filter(filter: string) {
    (this.layout as PanelLayout).removeWidget(this._filenameSearcher);
    this._filenameSearcher = KernelSourcesFilter({
      model: this._model,
      filter: filter
    });
    this._filenameSearcher.addClass(FILTERBOX_CLASS);
    (this.layout as PanelLayout).insertWidget(0, this._filenameSearcher);
  }

  /**
   * Dispose the sources body widget.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    this._editorHandler?.dispose();
    Signal.clearData(this);
    super.dispose();
  }

  /**
   * Clear the content of the kernel source read-only editor.
   */
  private _clear(): void {
    while ((this.layout as PanelLayout).widgets.length > 1) {
      (this.layout as PanelLayout).removeWidgetAt(1);
    }
  }

  private _model: IDebugger.Model.IKernelSources;
  private _filenameSearcher: ReactWidget;
  private _editorHandler: EditorHandler;
  private _debuggerService: IDebugger;
}

/**
 * A namespace for SourcesBody `statics`.
 */
export namespace KernelSourcesBody {
  /**
   * Instantiation options for `Breakpoints`.
   */
  export interface IOptions {
    /**
     * The debug service.
     */
    service: IDebugger;

    /**
     * The sources model.
     */
    model: IDebugger.Model.IKernelSources;

    /**
     * The filter to apply when showing the kernel sources.
     */
    filter: string;
  }
}
