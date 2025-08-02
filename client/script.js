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

  output.textContent = '⏳ Analyzing call...';

  try {
    const response = await fetch('http://localhost:5050/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error(`Server responded with ${response.status}`);

    const data = await response.json();

    if (!data.result) throw new Error("Malformed response from server.");

    output.textContent = data.result;
  } catch (err) {
    console.error(err);
    output.textContent = '❌ Error analyzing call. Check console for details.';
  }
});
