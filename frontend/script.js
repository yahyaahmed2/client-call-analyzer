const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const output = document.getElementById('output');

const fileNameDisplay = document.createElement('p');
fileNameDisplay.style.marginTop = '0.5rem';
fileNameDisplay.style.fontWeight = 'bold';
dropArea.appendChild(fileNameDisplay);

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) {
    fileNameDisplay.textContent = `📄 Selected file: ${fileInput.files[0].name}`;
  } else {
    fileNameDisplay.textContent = '';
  }
});

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

dropArea.addEventListener('click', () => fileInput.click());

analyzeBtn.addEventListener('click', async () => {
  if (!fileInput.files.length) {
    alert('⚠️ Please select a file.');
    return;
  }

  const file = fileInput.files[0];

const allowedTypes = [
  'text/plain',
  'audio/wav',
  'audio/mpeg',   
  'audio/mp3',
  'audio/m4a',
  'audio/x-m4a',   
  'audio/aac',
  'audio/flac',
  'audio/ogg',     
  'audio/oga',     
  'video/mp4',
  'video/webm'
];
  if (!allowedTypes.includes(file.type)) {
    alert('File type not supported, try without another file format.');
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

    const formatted = data.result.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    const withLineBreaks = formatted.replace(/\n/g, '<br>');          
    output.innerHTML = withLineBreaks;
    output.classList.add('show');
  } catch (err) {
    console.error(err);
    output.textContent = '❌ Error analyzing call. Check console for details.';
    output.classList.add('show');
  }
});