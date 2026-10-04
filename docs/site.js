'use strict';
// Presentation only. No requests, credentials, backend calls or Slack connection.
(() => {
  const scene = document.querySelector('.architecture');
  const nodes = [...document.querySelectorAll('[data-node]')];
  const links = [...document.querySelectorAll('[data-link]')];
  const status = document.getElementById('flow-status');
  const play = document.getElementById('play');
  const pause = document.getElementById('pause');
  const restart = document.getElementById('restart');
  const phases = [
    {node:0,text:'1 of 5 · A user submits /compliment what is s3 in Slack.'},
    {node:1,link:0,direction:'forward',text:'2 of 5 · RomeroOps-AI receives the Slack request.'},
    {node:2,link:1,direction:'forward',text:'3 of 5 · Node.js sends the prompt to Amazon Bedrock.'},
    {node:2,text:'4 of 5 · Amazon Bedrock generates the AI response.'},
    {node:1,link:1,direction:'backward',text:'5 of 5 · The response returns to RomeroOps-AI.'},
    {node:0,link:0,direction:'backward',text:'Complete · RomeroOps-AI delivers the answer to Slack.'}
  ];
  let step = -1;
  let timer = null;
  function draw(){
    nodes.forEach(n=>n.classList.remove('active'));
    links.forEach(n=>n.classList.remove('forward','backward'));
    if(step>=0){const p=phases[step];nodes[p.node].classList.add('active');if(p.link!==undefined)links[p.link].classList.add(p.direction);status.textContent=p.text;}
    else status.textContent='Ready to follow the request. This animation illustrates the tested workflow.';
  }
  function stop(){clearInterval(timer);timer=null;scene.classList.add('paused');play.disabled=false;pause.disabled=true;play.textContent=step===phases.length-1?'Replay workflow':step>=0?'Resume':'Play workflow';}
  function start(){if(timer)return;if(step===phases.length-1)step=-1;if(step<0)step=0;draw();scene.classList.remove('paused');play.disabled=true;pause.disabled=false;timer=setInterval(()=>{step++;draw();if(step===phases.length-1)stop();},1800);}
  play.addEventListener('click',start);pause.addEventListener('click',stop);
  restart.addEventListener('click',()=>{stop();step=-1;draw();play.textContent='Play workflow';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&timer)stop();});
  if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)start();
})();
