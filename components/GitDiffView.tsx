import { generateDiffFile } from '@git-diff-view/file';
import { DiffModeEnum, DiffView } from '@git-diff-view/react';
import { Icon } from 'idea-react';
import { computed, observable } from 'mobx';
import { observer } from 'mobx-react';
import { ObservedComponent } from 'mobx-react-helper';
import { Alert, Button, ButtonGroup, Form } from 'react-bootstrap';

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
              variant={
                diffViewMode & DiffModeEnum.Split
                  ? 'primary'
                  : 'outline-primary'
              }
              onClick={() => (this.diffViewMode = DiffModeEnum.Split)}
            >
              <Icon name="layout-split" />
            </Button>
            <Button
              variant={
                diffViewMode & DiffModeEnum.Split
                  ? 'outline-primary'
                  : 'primary'
              }
              onClick={() => (this.diffViewMode = DiffModeEnum.Unified)}
            >
              <Icon name="list-ul" />
            </Button>
          </ButtonGroup>

          <Form.Check
            type="switch"
            id="git-diff-wrap"
            label={<Icon name="text-wrap" />}
            checked={diffViewWrap}
            onChange={({ currentTarget }) =>
              (this.diffViewWrap = currentTarget.checked)
            }
          />
          <Form.Check
            type="switch"
            id="git-diff-highlight"
            label={<Icon name="highlighter" />}
            checked={diffViewHighlight}
            onChange={({ currentTarget }) =>
              (this.diffViewHighlight = currentTarget.checked)
            }
          />
          <Form.Check
            type="switch"
            id="git-diff-expand-all"
            label={<Icon name="arrows-expand" />}
            checked={expandAll}
            onChange={({ currentTarget }) =>
              (this.expandAll = currentTarget.checked)
            }
          />
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
        <Alert variant="danger">No diff found between the two files.</Alert>

        <pre>{props.oldFile.content}</pre>
      </>
    ) : (
      this.renderDiff()
    );
  }
}
