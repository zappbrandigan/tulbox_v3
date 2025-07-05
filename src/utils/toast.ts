const showToast = () => {
  document.getElementById('clipboard-toast')!.classList.remove('hidden');
  setTimeout(function () {
    document.getElementById('clipboard-toast')!.classList.add('hidden');
  }, 3000);
};

export default showToast;
