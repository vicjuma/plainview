import { Routes } from '@angular/router';
import { WorkspaceComponent } from './pages/workspace/workspace.component';
import { IntroductionComponent } from './pages/introduction/introduction.component';
import { FolderComponent } from './pages/folder/folder.component';
import { KnowledgeBaseComponent } from './pages/knowledge-base/knowledge-base.component';
import { VectorSearchComponent } from './pages/vector-search/vector-search.component';
import { TextSearchComponent } from './pages/text-search/text-search.component';

export const routes: Routes = [
  {
    path: '',
    component: IntroductionComponent,
  },
  {
    path: 'workspace',
    component: WorkspaceComponent,
  },
  {
    path: 'folder',
    component: FolderComponent,
  },
  {
    path: 'upload-and-embed',
    component: KnowledgeBaseComponent,
  },
  {
    path: 'vector-search',
    component: VectorSearchComponent,
  },
  {
    path: 'text-search',
    component: TextSearchComponent,
  },
];
