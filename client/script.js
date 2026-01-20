const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const output = document.getElementById('output');

// Create a file name display element
const fileNameDisplay = document.createElement('p');
fileNameDisplay.style.marginTop = '0.5rem';
fileNameDisplay.style.fontWeight = 'bold';
dropArea.appendChild(fileNameDisplay);

// Update display when a file is selected
fileInput.addEventListener('change', () => {
  if (fileInput.files.length) {
    fileNameDisplay.textContent = `📄 Selected file: ${fileInput.files[0].name}`;
  } else {
    fileNameDisplay.textContent = '';
  }
});

// Drag & drop UI
dropArea.addEventListener('dragover', e => {
  e.preventDefault();
  dropArea.style.backgroundColor = '#f0f8ff';
});

dropArea.addEventListener('dragleave', e => {
  e.preventDefault();
  dropArea.style.backgroundColor = 'transparent';
});

dropArea.addEventListener('drop', e => {
  e.preventDefault();
  dropArea.style.backgroundColor = 'transparent';
  const files = e.dataTransfer.files;
  if (files.length) {
    fileInput.files = files;
    fileNameDisplay.textContent = `📄 Selected file: ${files[0].name}`;
  }
});

// Click to open file dialog
dropArea.addEventListener('click', () => fileInput.click());

// Analyze button
analyzeBtn.addEventListener('click', async () => {
  if (!fileInput.files.length) {
    alert('⚠️ Please select a file.');
    return;
  }

  const file = fileInput.files[0];

  // Client-side allowed MIME types
  const allowedTypes = [
    'text/plain',
    'audio/wav',
    'audio/mpeg',
    'audio/mp4',
    'audio/x-m4a'
  ];

  if (!allowedTypes.includes(file.type)) {
    alert('❌ Only .txt or audio files (.wav, .mp3, .m4a, .mp4) are supported.');
    return;
  }

  const formData = new FormData();
  formData.append('transcript', file);

  const isAudio = file.type.startsWith('audio');
  output.textContent = isAudio ? '⏳ Transcribing audio...' : '⏳ Analyzing call...';
  
  const loader = document.createElement('span');
  loader.classList.add('loader');
  output.appendChild(loader);
  output.classList.add('show');

  try {
    const response = await fetch('http://localhost:5050/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error(`Server responded with ${response.status}`);

    const data = await response.json();
    if (!data.result) throw new Error("Malformed response from server.");

    // Bold headings
    const formatted = data.result.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    output.innerHTML = formatted;
    output.classList.add('show');
  } catch (err) {
    console.error(err);
    output.textContent = '❌ Error analyzing call. Check console for details.';
    output.classList.add('show');
  }
});
