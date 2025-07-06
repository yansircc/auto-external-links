# 架构重构迁移指南

本指南帮助你从旧架构迁移到新的服务层架构。

## 主要变化

### 1. 分层架构

**旧架构：**
```
Components → Store (包含业务逻辑) → Server Actions
```

**新架构：**
```
Components → Custom Hooks → Services → Server Actions
           ↘              ↗
              Pure Store
```

### 2. Store 职责变化

**旧的 Store（混合职责）：**
```typescript
// src/stores/keyword-editor.ts
export const useKeywordEditorStore = create((set, get) => ({
  // 状态 + 业务逻辑 + API 调用
  handleSubmit: async (data, fingerprint) => {
    // 认证检查、API 调用、错误处理都在这里
  },
}));
```

**新的 Store（纯状态管理）：**
```typescript
// src/stores/keyword-editor-v2.ts
export const useKeywordEditorStore = create((set, get) => ({
  // 仅包含状态和纯粹的状态更新方法
  text: '',
  setText: (text) => set({ text }),
}));
```

## 迁移步骤

### 第一步：更新组件导入

**旧代码：**
```typescript
import { useKeywordEditorStore } from '@/stores/keyword-editor';

function KeywordEditor() {
  const { handleSubmit, handleConfirm } = useKeywordEditorStore();
  
  const onSubmit = (data: FormData) => {
    handleSubmit(data, fingerprint);
  };
}
```

**新代码：**
```typescript
import { useKeywordAnalysis } from '@/hooks/keyword';

function KeywordEditor() {
  const { analyzeText, fetchLinks } = useKeywordAnalysis();
  
  const onSubmit = (data: FormData) => {
    analyzeText(data, fingerprint);
  };
}
```

### 第二步：更新错误处理

**旧代码：**
```typescript
import { showAnalysisError, showServerError } from '@/components/keyword-editor/core/toast-handler';

// 在 Store 中
if (result.error) {
  showAnalysisError(result.error, () => void get().handleSubmit(data));
}
```

**新代码：**
```typescript
// 错误处理已集成在 Hook 中，使用统一的 toast
const { toast } = useToast();

// 错误会自动处理并显示适当的 toast 消息
```

### 第三步：使用新的类型定义

**旧代码：**
```typescript
// 类型分散在各个文件中
import type { KeywordMatch } from '@/components/keyword-editor/core/schema';
```

**新代码：**
```typescript
// 统一的类型导入
import type { KeywordMatch, KeywordMetadata } from '@/types/keywords';
```

### 第四步：更新 Server Actions

**旧的 Server Action：**
```typescript
export async function getKeywords(text: string, fingerprint?: string) {
  // 混合了认证、限流、AI 调用等逻辑
}
```

**新的使用方式：**
```typescript
// 通过 Service 调用，职责分离
const keywordService = new KeywordService();
const result = await keywordService.analyzeText(text, fingerprint);
```

## 组件迁移示例

### 编辑表单组件

**旧代码：**
```typescript
function EditorForm() {
  const { handleSubmit, isLoading } = useKeywordEditorStore();
  
  const onSubmit = async (data: FormData) => {
    await handleSubmit(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... */}
    </form>
  );
}
```

**新代码：**
```typescript
function EditorForm() {
  const { analyzeText, isLoading } = useKeywordAnalysis();
  const { isLoading: storeLoading } = useKeywordEditorStore();
  
  const onSubmit = async (data: FormData) => {
    await analyzeText(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... */}
    </form>
  );
}
```

### 关键词预览组件

**旧代码：**
```typescript
function KeywordPreview() {
  const { 
    matches, 
    selectedKeywordIds, 
    toggleKeyword,
    handleConfirm 
  } = useKeywordEditorStore();
  
  return (
    <div>
      {matches.map(match => (
        <Keyword
          key={match.id}
          selected={selectedKeywordIds.has(match.id)}
          onClick={() => toggleKeyword(match.id)}
        />
      ))}
      <button onClick={handleConfirm}>确认</button>
    </div>
  );
}
```

**新代码：**
```typescript
function KeywordPreview() {
  const { fetchLinks } = useKeywordAnalysis();
  const { 
    handleToggleKeyword, 
    isKeywordSelected,
    matches 
  } = useKeywordSelection();
  
  return (
    <div>
      {matches.map(match => (
        <Keyword
          key={match.id}
          selected={isKeywordSelected(match.id)}
          onClick={() => handleToggleKeyword(match.id)}
        />
      ))}
      <button onClick={fetchLinks}>生成链接</button>
    </div>
  );
}
```

## 测试迁移

### 旧的测试方式

```typescript
// 难以测试，因为 Store 包含了太多逻辑
it('should analyze text', async () => {
  // 需要 mock 整个 store 和所有依赖
});
```

### 新的测试方式

```typescript
// 服务层测试
describe('KeywordService', () => {
  it('should analyze text', async () => {
    const service = new KeywordService();
    const result = await service.analyzeText('test text');
    expect(result.success).toBe(true);
  });
});

// Hook 测试
describe('useKeywordAnalysis', () => {
  it('should handle analysis', async () => {
    const { result } = renderHook(() => useKeywordAnalysis());
    await act(async () => {
      await result.current.analyzeText({ text: 'test' });
    });
    expect(result.current.isLoading).toBe(false);
  });
});
```

## 性能优化

新架构提供了更好的性能优化机会：

1. **服务层缓存：**
```typescript
// AuthService 内置了会话缓存
const session = await authService.getSession(); // 有缓存
```

2. **选择性订阅：**
```typescript
// 只订阅需要的状态
const isLoading = useKeywordEditorStore(state => state.isLoading);
```

3. **计算值缓存：**
```typescript
// 使用 selectors 避免重复计算
const selectedKeywords = useKeywordEditorStore(
  keywordEditorSelectors.getSelectedKeywords
);
```

## 注意事项

1. **逐步迁移：** 可以先迁移新功能，旧功能逐步改造
2. **保持兼容：** 迁移期间可以同时保留新旧两套代码
3. **测试覆盖：** 迁移后要确保所有功能都有测试覆盖

## 迁移检查清单

- [ ] 更新所有组件的 Store 使用为 Hooks
- [ ] 移除旧的 Store 文件
- [ ] 更新类型导入路径
- [ ] 添加错误边界组件
- [ ] 为关键功能添加测试
- [ ] 更新文档

## 获取帮助

如有问题，请查看：
- 新架构的类型定义：`src/types/`
- 服务层实现：`src/services/`
- Hook 实现：`src/hooks/keyword/`