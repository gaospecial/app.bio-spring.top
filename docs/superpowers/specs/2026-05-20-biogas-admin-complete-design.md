# Biogas Admin Module - Complete Existing Features

## Overview

Complete and improve the `biogas-literature` admin module in `app.bio-spring.top`. Focus on: comprehensive operations for each pipeline stage, simplified interpretation page, and proper CRUD lifecycle management.

## Goals

1. Upload page: pure upload interface (remove redundant paper list)
2. Parsing page: paper management center with full operations (retry, reset, delete, search, filter)
3. Interpretation page: compact list view + Modal editing (replace verbose card view)
4. Backend: add delete and reset endpoints

## Backend Changes

### New Endpoints (api.bio-spring.top)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `DELETE` | `/admin/papers/{paper_id}` | Admin | Soft delete paper (`is_deleted=True`) |
| `DELETE` | `/admin/articles/{article_id}` | Admin | Soft delete article (`is_deleted=True`) |
| `POST` | `/papers/{paper_id}/reset` | Admin | Reset paper status to `uploading`, clear `error_message`, soft-delete associated article |

### ArticleUpdate Schema Enhancement

Add missing fields to `ArticleUpdate` schema for modal editing:

```python
class ArticleUpdate(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    slug: str | None = None
    category: str | None = None
    tags: list[str] | None = None
    content_md: str | None = None
    understanding_points: list[str] | None = None
    status: str | None = None
    # New fields for modal editing:
    slurry_type: str | None = None
    crop: str | None = None
    soil_type: str | None = None
    dosage: str | None = None
    application_method: str | None = None
    yield_benefit: str | None = None
    quality_benefit: str | None = None
    risk_control: str | None = None
    source_citation: str | None = None
    authors: str | None = None
```

## Frontend Changes

### Navigation Update (moduleRegistry.ts)

Remove `parsing` from nav items, rename to make flow clearer:

```typescript
navItems: [
  { href: '/upload', label: '文献上传', icon: 'upload_file' },
  { href: '/parsing', label: '文献管理', icon: 'description' },
  { href: '/interpretation', label: 'LLM 解读', icon: 'psychology' },
  { href: '/qa', label: '文献问答', icon: 'chat' },
]
```

### Page 1: Upload (upload/page.tsx)

**Remove**: "已上传文献" table section (lines 146-179)

**Keep**:
- Drag-and-drop upload zone
- Upload progress list (`uploads` state)
- Auto-trigger `processBiogasPaper()` after upload

### Page 2: Parsing - Paper Management Center (parsing/page.tsx)

Major rewrite. New layout:

**Top bar**: Search input + Status filter Select + Auto-refresh indicator

**Table columns**:

| Column | Width | Content |
|--------|-------|---------|
| 标题 | auto | `paper.title ?? paper.id` |
| 状态 | w-24 | Badge (待解析/解析中/已完成/失败) |
| 错误信息 | w-48 | Truncated error, full on hover |
| 关联文章 | w-32 | Article title or `-`, click to view |
| 上传时间 | w-32 | `created_at` formatted |
| 操作 | w-40 | Action buttons |

**Action buttons by status**:
- `uploading` or `failed`: **重试** (Button primary sm) -> calls `processBiogasPaper(id)`
- `completed` or `failed`: **重置** (Button secondary sm) -> calls `resetBiogasPaper(id)` -> ConfirmDialog
- All statuses: **删除** (Button danger sm) -> ConfirmDialog -> calls `deleteBiogasPaper(id)`

**Auto-refresh**: When any paper has `status === 'processing'`, set up `setInterval` polling every 8 seconds. Clean up when no papers are processing.

**Search/Filter**: Client-side filtering on title text + status value.

### Page 3: Interpretation - Article List (interpretation/page.tsx)

Complete rewrite from card view to compact table.

**Table columns**:

| Column | Content |
|--------|---------|
| 标题 | Article title |
| 分类 | Category badge or `-` |
| 状态 | Badge (published/draft) |
| 发布时间 | Formatted date or `-` |
| 操作 | Edit + Delete buttons |

**Edit Modal** (`ArticleEditModal` component):

Fields in the modal form:
- Title (Input)
- Subtitle (Input)
- Category (Select: 水稻, 小麦, 蔬菜, 果树, 土壤改良, 综合)
- Status (Select: draft, published)
- Understanding Points (dynamic list: display each point with delete button + input to add new point)
- Slurry Type (Input)
- Crop (Input)
- Soil Type (Input)
- Dosage (Input)
- Application Method (Input)
- Yield Benefit (Input)
- Quality Benefit (Input)
- Risk Control (Input textarea)
- Source Citation (Input)
- Authors (Input)

Modal footer: Cancel + Save buttons. Save calls `updateBiogasArticle(id, data)`.

**Delete**: ConfirmDialog -> calls `deleteBiogasArticle(id)`.

### New API Functions (app.api.ts)

```typescript
export async function deleteBiogasPaper(paperId: string): Promise<void> {
  await api.delete(`/api/v1/biogas/admin/papers/${paperId}`)
}

export async function resetBiogasPaper(paperId: string): Promise<{ id: string }> {
  const res = await api.post(`/api/v1/biogas/papers/${paperId}/reset`)
  return (res.data as ApiResponse<{ id: string }>).data
}

export async function deleteBiogasArticle(articleId: string): Promise<void> {
  await api.delete(`/api/v1/biogas/admin/articles/${articleId}`)
}

export async function updateBiogasArticle(
  articleId: string,
  data: Partial<BiogasArticle>
): Promise<BiogasArticle> {
  const res = await api.put(`/api/v1/biogas/admin/articles/${articleId}`, data)
  return (res.data as ApiResponse<BiogasArticle>).data
}

export async function getBiogasArticle(articleId: string): Promise<BiogasArticle> {
  const res = await api.get(`/api/v1/biogas/admin/articles/${articleId}`)
  return (res.data as ApiResponse<BiogasArticle>).data
}
```

### Types Update (types.ts)

Extend `BiogasArticle` with all editable fields:

```typescript
export interface BiogasArticle {
  id: string
  title: string
  subtitle: string | null
  slug: string
  category: string | null
  tags: string[] | null
  slurry_type: string | null
  crop: string | null
  soil_type: string | null
  dosage: string | null
  application_method: string | null
  yield_benefit: string | null
  quality_benefit: string | null
  risk_control: string | null
  understanding_points: string[] | null
  content_md: string | null
  source_citation: string | null
  authors: string | null
  status: string
  paper_id: number | null
  published_at: string | null
  created_at: string | null
  updated_at: string | null
}
```

Remove unused `BiogasInterpretation` interface.

## UI Components Used

- `Card` - page containers
- `Table<T>` - paper list, article list
- `Badge` - status display
- `Button` - actions (primary/secondary/danger/ghost)
- `Modal` - article edit
- `ConfirmDialog` - delete/reset confirmation
- `Input` - search, form fields
- `Select` - status filter, category select

## File Changes Summary

### Backend (api.bio-spring.top)
- `core/biogas/router.py` - Add 3 new endpoints
- `core/biogas/schemas.py` - Extend ArticleUpdate schema

### Frontend (app.bio-spring.top)
- `src/lib/moduleRegistry.ts` - Rename parsing nav label
- `src/lib/api.ts` - Add 5 new API functions
- `src/lib/types.ts` - Extend BiogasArticle, remove BiogasInterpretation
- `src/app/(authenticated)/biogas-literature/upload/page.tsx` - Remove paper list table
- `src/app/(authenticated)/biogas-literature/parsing/page.tsx` - Complete rewrite
- `src/app/(authenticated)/biogas-literature/interpretation/page.tsx` - Complete rewrite
- `src/app/(authenticated)/biogas-literature/interpretation/ArticleEditModal.tsx` - New component
