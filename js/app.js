document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("file-input");
  const dropArea = document.getElementById("drop-area");
  const thumbnailContainer = document.getElementById("thumbnail-container");
  const uploadButton = document.getElementById("upload-button");
  const downloadAllButton = document.getElementById("download-all-button");
  let jpgUrls = [];

  // Drag and drop functionality
  dropArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.add("border-green-500");
  });

  dropArea.addEventListener("dragleave", function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove("border-green-500");
  });

  dropArea.addEventListener("drop", function (e) {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove("border-green-500");
    const files = e.dataTransfer.files;
    handleFiles(files);
  });

  dropArea.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    const files = fileInput.files;
    handleFiles(files);
  });

  uploadButton.addEventListener("click", function () {
    fileInput.click();
  });

  function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === "image/png") {
        const reader = new FileReader();
        reader.onload = function (event) {
          const img = new Image();
          img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const jpgUrl = canvas.toDataURL("image/jpeg");
            jpgUrls.push(jpgUrl);
            displayThumbnail(jpgUrl);
          }
          img.src = event.target.result.toString();
        }
        reader.readAsDataURL(file);
      }
    }
  }

  function displayThumbnail(url) {
    const imgDiv = document.createElement("div");
    imgDiv.className = "relative m-2 w-40 h-40 border border-gray-300 rounded overflow-hidden";
    imgDiv.innerHTML = `
            <img src="${url}" alt="Image" class="object-cover w-full h-full">
            <a href="${url}" download="image.jpg" class="absolute bottom-2 left-2 bg-blue-500 text-white px-2 py-1 text-sm rounded">Download</a>
            <button class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-sm rounded" onclick="removeImage(this)">X</button>
        `;
    thumbnailContainer.appendChild(imgDiv);
  }

  window.removeImage = function (button) {
    const imgDiv = button.parentElement;
    thumbnailContainer.removeChild(imgDiv);
    const url = imgDiv.querySelector("img").src;
    jpgUrls = jpgUrls.filter(jpgUrl => jpgUrl !== url);
  };

  downloadAllButton.addEventListener("click", function () {
    const zip = new JSZip();
    jpgUrls.forEach((url, index) => {
      const base64Data = url.replace(/^data:image\/jpeg;base64,/, "");
      zip.file(`image${index + 1}.jpg`, base64Data, {base64: true});
    });

    zip.generateAsync({type: "blob"}).then(function (content) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = 'images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  });
});
