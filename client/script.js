document.getElementById('analyzeBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('fileInput');
  const output = document.getElementById('output');

  if (!fileInput.files.length) {
    alert('⚠️ Please select a .txt file.');
    return;
  }

  const file = fileInput.files[0];

  if (file.type !== "text/plain") {
    alert('❌ Only .txt files are supported.');
    return;
  }

  const formData = new FormData();
  formData.append('transcript', file);

  // Show loader
  output.textContent = '⏳ Analyzing call...';
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

    output.innerHTML = formatted;
    output.classList.add('show');
  } catch (err) {
    console.error(err);
    output.textContent = '❌ Error analyzing call. Check console for details.';
    output.classList.add('show');
  }
});
