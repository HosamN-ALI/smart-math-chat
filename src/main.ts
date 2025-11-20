interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class ChatApp {
  private chatContainer: HTMLElement;
  private messageInput: HTMLInputElement;
  private sendButton: HTMLButtonElement;
  private messages: ChatMessage[] = [];
  private isLoading = false;

  private supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  private supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  constructor() {
    this.chatContainer = document.getElementById('chatContainer')!;
    this.messageInput = document.getElementById('messageInput') as HTMLInputElement;
    this.sendButton = document.getElementById('sendButton') as HTMLButtonElement;

    this.init();
  }

  private init() {
    this.sendButton.addEventListener('click', () => this.handleSend());
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });
  }

  private async handleSend() {
    const message = this.messageInput.value.trim();
    if (!message || this.isLoading) return;

    this.addMessage('user', message);
    this.messageInput.value = '';
    this.messageInput.focus();

    this.isLoading = true;
    this.updateButtonState();
    this.showTypingIndicator();

    try {
      const response = await this.sendMessageToAPI(message);
      this.removeTypingIndicator();
      this.addMessage('assistant', response);
    } catch (error) {
      this.removeTypingIndicator();
      this.addMessage('assistant', 'عذراً، حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.');
      console.error('Error:', error);
    } finally {
      this.isLoading = false;
      this.updateButtonState();
    }
  }

  private async sendMessageToAPI(userMessage: string): Promise<string> {
    this.messages.push({
      role: 'user',
      content: userMessage
    });

    const apiUrl = `${this.supabaseUrl}/functions/v1/smart-math-chat`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.supabaseAnonKey}`,
      },
      body: JSON.stringify({
        messages: this.messages,
        model: 'anthropic/claude-3.5-sonnet',
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    this.messages.push({
      role: 'assistant',
      content: assistantMessage
    });

    return assistantMessage;
  }

  private addMessage(role: 'user' | 'assistant', content: string) {
    const welcomeMessage = this.chatContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? '👤' : '🧮';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    this.chatContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  private showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant typing-indicator';
    typingDiv.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🧮';

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message-content';

    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'loading';

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'loading-dot';
      dotsContainer.appendChild(dot);
    }

    loadingDiv.appendChild(dotsContainer);
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(loadingDiv);

    this.chatContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }

  private removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
      indicator.remove();
    }
  }

  private updateButtonState() {
    this.sendButton.disabled = this.isLoading;
    this.messageInput.disabled = this.isLoading;
  }

  private scrollToBottom() {
    setTimeout(() => {
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }, 100);
  }
}

new ChatApp();
