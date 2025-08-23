(function(){
  'use strict';

  function initFlipbook(container) {
    try {
      var dataScript = container.querySelector('script.wp3d-data');
      var config = JSON.parse(dataScript.textContent || '{}');
      var pages = config.pages || [];
      var width = config.width || 800;
      var height = config.height || 600;
      var bg = config.bg || '#ffffff';

      var canvasHost = container.querySelector('.wp3d-canvas');
      var scene = new THREE.Scene();
      scene.background = new THREE.Color(bg);
      var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 0, 6);

      var renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      canvasHost.innerHTML = '';
      canvasHost.appendChild(renderer.domElement);

      function onResize() {
        var hostWidth = container.clientWidth;
        var scale = hostWidth / width;
        var w = Math.max(200, Math.round(width * scale));
        var h = Math.max(200, Math.round(height * scale));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      window.addEventListener('resize', onResize);

      var loader = new THREE.TextureLoader();
      var materials = pages.map(function(url){
        var tex = loader.load(url);
        tex.colorSpace = THREE.SRGBColorSpace || THREE.LinearSRGBColorSpace; // version-safe
        return new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide });
      });

      var geometry = new THREE.PlaneGeometry(4, 5.2);
      var leftPage = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      var rightPage = new THREE.Mesh(geometry, materials[0] || new THREE.MeshBasicMaterial({ color: 0xdddddd }));
      leftPage.position.set(-2.05, 0, 0);
      rightPage.position.set(2.05, 0, 0);

      scene.add(leftPage);
      scene.add(rightPage);

      var currentIndex = 0; // index points to right page texture

      function updatePages() {
        var leftIndex = Math.max(0, currentIndex - 1);
        if (materials[leftIndex]) leftPage.material = materials[leftIndex];
        if (materials[currentIndex]) rightPage.material = materials[currentIndex];
      }

      function animateFlip(next) {
        var duration = 400; // ms
        var start = performance.now();
        var startRotY = next ? 0 : Math.PI;
        var endRotY = next ? Math.PI : 0;

        var page = new THREE.Mesh(geometry, next ? rightPage.material : leftPage.material);
        page.position.copy(next ? rightPage.position : leftPage.position);
        page.rotation.y = startRotY;
        scene.add(page);

        function step(now) {
          var t = Math.min(1, (now - start) / duration);
          var eased = t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t; // easeInOutQuad
          page.rotation.y = startRotY + (endRotY - startRotY) * eased;
          renderer.render(scene, camera);
          if (t < 1) requestAnimationFrame(step);
          else {
            scene.remove(page);
            renderer.render(scene, camera);
          }
        }
        requestAnimationFrame(step);
      }

      function goNext() {
        if (currentIndex < materials.length - 1) {
          animateFlip(true);
          currentIndex += 1;
          updatePages();
        }
      }
      function goPrev() {
        if (currentIndex > 0) {
          animateFlip(false);
          currentIndex -= 1;
          updatePages();
        }
      }

      var prevBtn = container.querySelector('.wp3d-prev');
      var nextBtn = container.querySelector('.wp3d-next');
      prevBtn.addEventListener('click', goPrev);
      nextBtn.addEventListener('click', goNext);

      updatePages();
      onResize();
      renderer.setAnimationLoop(function(){
        renderer.render(scene, camera);
      });

    } catch (e) {
      console.error('WP3D Flipbook init failed', e);
    }
  }

  function boot() {
    var nodes = document.querySelectorAll('.wp3d-flipbook');
    nodes.forEach(initFlipbook);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();