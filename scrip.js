import Groq from 'https://esm.sh/groq-sdk';

const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const apiKeyInput = document.getElementById('apiKeyInput');
const sendBtn = document.getElementById('sendBtn');

// Histórico da conversa com a instrução do Agente
const history = [
  {
    role: 'system',
    content: `Você é o Professor Newton, um professor de Física muito empolgado e didático para alunos do Ensino Médio. 
    Sua missão é explicar conceitos de física (mecânica, termodinâmica, óptica, eletromagnetismo, etc.) de forma simples, usando analogias do dia a dia, exemplos práticos e mantendo um tom encorajador e divertido. 
    Evite jargões excessivamente acadêmicos sem explicação prévia. Sempre que relevante, utilize equações simples e explique o significado de cada variável.`
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

  const apiKey = apiKeyInput.value.trim();
  const text = userInput.value.trim();

  if (!apiKey) {
    alert('Por favor, insira sua chave da API do Groq.');
    return;
  }

  if (!text) return;

  // Exibe mensagem do usuário
  appendMessage('user', text);
  history.push({ role: 'user', content: text });
  userInput.value = '';
  
  // Interface em estado de carregamento
  sendBtn.disabled = true;
  const loadingMessage = appendMessage('assistant', 'Pensando na resposta...');

  try {
    const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });

    const completion = await groq.chat.completions.create({
      messages: history,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseText = completion.choices[0]?.message?.content || 'Não consegui processar sua dúvida. Tente novamente!';
    
    // Atualiza texto de carregamento com a resposta real
    loadingMessage.textContent = responseText;
    history.push({ role: 'assistant', content: responseText });

  } catch (error) {
    console.error('Erro na chamada da API Groq:', error);
    loadingMessage.textContent = 'Ops! Ocorreu um erro ao conectar com o Groq. Verifique sua API Key.';
  } finally {
    sendBtn.disabled = false;
  }
});