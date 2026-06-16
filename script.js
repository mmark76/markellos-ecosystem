const nodes = document.querySelectorAll('.node');

nodes.forEach((node) => {
  node.addEventListener('pointermove', (event) => {
    const rect = node.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    node.style.setProperty('--pointer-x', `${x}px`);
    node.style.setProperty('--pointer-y', `${y}px`);
  });
});
