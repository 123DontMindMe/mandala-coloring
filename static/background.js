var particlesEnabled = true;

setInterval(() => {
	if (!particlesEnabled) return;

	let particle = document.createElement("div");
	let brightness = 180 + Math.random() * 50;
	particle.style.zIndex = "-1";
	particle.style.display = "inline-block";
  particle.style.borderRadius = "100%";
	particle.style.backgroundColor = "rgb(" + brightness + ", " + brightness + ", 255)";
	particle.style.width = particle.style.height = "20px";
	particle.style.position = "absolute";
	let angle = Math.random() * 2 * Math.PI;
	let startX = Math.cos(angle) * 10 + 50;
	let startY = Math.sin(angle) * 10 + 50;
	particle.style.left = startX + "%";
	particle.style.top = startY + "%";
	particle.style.transform = "translate(-50%, -50%)";
	particle.style.opacity = "0.6";
	let duration = 3 + Math.random() * 8;
	particle.style.transition = `
		left ${duration}s ease-in-out, 
		top ${duration}s ease-in-out, 
		width ${duration}s ease-in-out,
		height ${duration}s ease-in-out,
		opacity ${duration}s ease-in-out
	`;
	document.body.appendChild(particle);

	setTimeout(() => {
		particle.style.opacity = "0";
		let angle = Math.random() * 2 * Math.PI;
		let endX = Math.cos(angle) * 60 + 50;
		let endY = Math.sin(angle) * 60 + 50;
		particle.style.left = endX + "%";
		particle.style.top = endY + "%";
		let endSize = 20 + Math.random() * 80;
		particle.style.width = particle.style.height = endSize + "px";
	}, 1);

	setTimeout(particle.remove.bind(particle), duration * 1000);

}, 3000);