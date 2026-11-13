import { generateDiffFile } from '@git-diff-view/file';
import { DiffModeEnum, DiffView } from '@git-diff-view/react';
import { Alert, Button, ButtonGroup, FormSwitch, Icon } from 'idea-react';
import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { ObservedComponent } from 'mobx-react-helper';

export interface TextFileData {
  fileName: string;
  content: string;
  language?: string;
}

export type GitDiffViewProps = Record<'oldFile' | 'newFile', TextFileData>;

@observer
export class GitDiffView extends ObservedComponent<GitDiffViewProps> {
  @observable
  accessor diffViewMode = DiffModeEnum.Split;

  @observable
  accessor diffViewWrap = false;

  @observable
  accessor diffViewHighlight = true;

  @observable
  accessor expandAll = false;

  @computed
  get hasNoDiff() {
    const { oldFile, newFile } = this.observedProps;

    return oldFile.content === newFile.content;
  }

  @computed
  get diffFile() {
    const { oldFile, newFile } = this.observedProps;
    const { diffViewMode, expandAll } = this;

    const file = generateDiffFile(
      oldFile.fileName,
      oldFile.content,
      newFile.fileName,
      newFile.content,
      oldFile.language || 'text',
      newFile.language || 'text',
    );
    file.init();

    if (diffViewMode & DiffModeEnum.Split) {
      file.buildSplitDiffLines();
    } else {
      file.buildUnifiedDiffLines();
    }
    if (expandAll)
      file.onAllExpand(diffViewMode & DiffModeEnum.Split ? 'split' : 'unified');

    return file;
  }

  renderDiff() {
    const {
      diffViewMode,
      diffViewWrap,
      diffViewHighlight,
      expandAll,
      diffFile,
    } = this;

    return (
      <>
        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <ButtonGroup size="sm" aria-label="Diff mode">
            <Button
              variant={diffViewMode & DiffModeEnum.Split ? 'solid' : 'outline'}
              theme="primary"
              onClick={() => (this.diffViewMode = DiffModeEnum.Split)}
            >
              <Icon name="layout-split" />
            </Button>
            <Button
              variant={diffViewMode & DiffModeEnum.Split ? 'outline' : 'solid'}
              theme="primary"
              onClick={() => (this.diffViewMode = DiffModeEnum.Unified)}
            >
              <Icon name="list-ul" />
            </Button>
          </ButtonGroup>

          <FormSwitch
            inputId="git-diff-wrap"
            checked={diffViewWrap}
            onChange={({ currentTarget }) =>
              (this.diffViewWrap = currentTarget.checked)
            }
          >
            <Icon name="text-wrap" />
            <span className="visually-hidden">Wrap lines</span>
          </FormSwitch>
          <FormSwitch
            inputId="git-diff-highlight"
            checked={diffViewHighlight}
            onChange={({ currentTarget }) =>
              (this.diffViewHighlight = currentTarget.checked)
            }
          >
            <Icon name="highlighter" />
            <span className="visually-hidden">Highlight changes</span>
          </FormSwitch>
          <FormSwitch
            inputId="git-diff-expand-all"
            checked={expandAll}
            onChange={({ currentTarget }) =>
              (this.expandAll = currentTarget.checked)
            }
          >
            <Icon name="arrows-expand" />
            <span className="visually-hidden">Expand all</span>
          </FormSwitch>
        </div>

        <link
          rel="stylesheet"
          href="https://unpkg.com/@git-diff-view/react/styles/diff-view.css"
        />
        <DiffView
          diffFile={diffFile}
          diffViewMode={diffViewMode}
          diffViewWrap={diffViewWrap}
          diffViewHighlight={diffViewHighlight}
        />
      </>
    );
  }

  render() {
    const { hasNoDiff, props } = this;

    return hasNoDiff ? (
      <>
        <Alert theme="danger">No diff found between the two files.</Alert>

        <pre>{props.oldFile.content}</pre>
      </>
    ) : (
      this.renderDiff()
    );
  }
}
