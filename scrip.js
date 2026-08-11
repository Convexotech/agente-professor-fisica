const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

const history = [
  {
    role: 'system',
    content: `Você é o Professor Newton, um professor de Física muito empolgado e didático para alunos do Ensino Médio. 
    Sua missão é explicar conceitos de física de forma simples, usando analogias do dia a dia, exemplos práticos e mantendo um tom encorajador.`
  }
];

function appendMessage(role, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', role);
  messageDiv.textContent = text;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return messageDiv;
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = userInput.value.trim();
  if (!text) return;

  appendMessage('user', text);
  history.push({ role: 'user', content: text });
  userInput.value = '';

  sendBtn.disabled = true;
  const loadingMessage = appendMessage('assistant', 'Pensando na resposta...');

  try {
    // Chamada para a Serverless Function do Netlify
    const response = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    loadingMessage.textContent = data.response;
    history.push({ role: 'assistant', content: data.response });

  } catch (error) {
    console.error('Erro no cliente:', error);
    loadingMessage.textContent = 'Ops! Não consegui conectar com o servidor. Tente novamente mais tarde.';
  } finally {
    sendBtn.disabled = false;
  }
});