export interface SearchEntry {
  title: string;
  description: string;
  href: string;
  tags: string[];
}

export function normalizeSearchText(value: string): string {
  return value.trim().toLocaleLowerCase('zh-CN').replace(/\s+/g, ' ');
}

export function filterSearchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  const needle = normalizeSearchText(query);
  if (!needle) return [];
  return entries.filter((entry) => normalizeSearchText([entry.title, entry.description, ...entry.tags].join(' ')).includes(needle));
}

if (typeof document !== 'undefined') {
  const dialog = document.querySelector<HTMLDialogElement>('[data-search-dialog]');
  const trigger = document.querySelector<HTMLButtonElement>('[data-search-open]');
  const input = dialog?.querySelector<HTMLInputElement>('[data-search-input]');
  const results = dialog?.querySelector<HTMLElement>('[data-search-results]');
  let entries: SearchEntry[] | undefined;

  const render = (matches: SearchEntry[], hasQuery: boolean) => {
    if (!results) return;
    if (!hasQuery) {
      results.innerHTML = '<p class="search-empty">输入标题、摘要或标签开始搜索。</p>';
      return;
    }
    if (matches.length === 0) {
      results.innerHTML = '<p class="search-empty">没有找到相关内容，换一个关键词试试。</p>';
      return;
    }
    results.innerHTML = matches.map((entry, index) => `
      <a class="search-result" href="${entry.href}">
        <span>${String(index + 1).padStart(2, '0')}</span>
        <strong>${entry.title.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char)}</strong>
        <small>${entry.tags.join(' / ')}</small>
      </a>`).join('');
  };

  trigger?.addEventListener('click', async () => {
    dialog?.showModal();
    input?.focus();
    if (!entries && dialog && results) {
      results.setAttribute('aria-busy', 'true');
      results.innerHTML = '<p class="search-empty">正在加载搜索索引…</p>';
      try {
        const response = await fetch(dialog.dataset.searchUrl ?? 'search-index.json');
        if (!response.ok) throw new Error(`Search index request failed: ${response.status}`);
        entries = await response.json();
        render([], false);
      } catch {
        results.innerHTML = '<p class="search-empty">搜索索引加载失败，请稍后重试。</p>';
      } finally {
        results.removeAttribute('aria-busy');
      }
    }
  });

  dialog?.addEventListener('close', () => trigger?.focus());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  input?.addEventListener('input', () => render(filterSearchEntries(entries ?? [], input.value), input.value.trim().length > 0));
}
