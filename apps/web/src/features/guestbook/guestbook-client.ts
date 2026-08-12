interface GuestbookMessage {
  id: number;
  name: string;
  message: string;
  createdAt: string;
}

export function createMessagesUrl(apiBaseUrl: string): string {
  return `${apiBaseUrl.replace(/\/+$/, '')}/api/messages`;
}

export async function initializeGuestbook(root: HTMLElement, apiBaseUrl: string): Promise<void> {
  const form = root.querySelector<HTMLFormElement>('[data-message-form]');
  const formStatus = root.querySelector<HTMLElement>('[data-form-status]');
  const status = root.querySelector<HTMLElement>('[data-messages-status]');
  const list = root.querySelector<HTMLElement>('[data-messages-list]');

  if (!form || !formStatus || !status || !list) return;

  const messagesUrl = createMessagesUrl(apiBaseUrl);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    formStatus.textContent = '正在提交……';

    const data = new FormData(form);
    const response = await fetch(messagesUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.get('name'), message: data.get('message') }),
    });

    if (!response.ok) {
      formStatus.textContent = '提交失败，请稍后再试。';
      return;
    }

    form.reset();
    formStatus.textContent = '留言已提交。刷新页面即可看到。';
  });

  try {
    const response = await fetch(messagesUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const messages = await response.json() as GuestbookMessage[];
    status.textContent = messages.length ? '' : '还没有留言。';

    for (const item of messages) {
      const article = document.createElement('article');
      article.className = 'message-card';
      article.innerHTML = `
        <div class="message-card__meta">
          <strong></strong>
          <time></time>
        </div>
        <p></p>
      `;
      article.querySelector('strong')!.textContent = item.name;
      article.querySelector('time')!.textContent = new Date(item.createdAt).toLocaleString();
      article.querySelector('p')!.textContent = item.message;
      list.append(article);
    }
  } catch {
    status.textContent = '暂时无法加载留言，请确认本地 API 正在运行。';
  }
}
