import { auth, db } from "./firebase.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { gerarMeses, sortearItem } from "./sorteio.js";

/* LOGIN */
window.login = async ()=>{
    try{
        await signInWithEmailAndPassword(auth,user.value,pass.value);
    }catch{
        await createUserWithEmailAndPassword(auth,user.value,pass.value);
    }
};

onAuthStateChanged(auth,(u)=>{
    loginBox.style.display = u ? "none":"block";
    app.style.display = u ? "block":"none";
});

window.logout = ()=> signOut(auth);

/* PARTICIPANTES */
window.gerar = ()=>{
    lista.innerHTML="";
    for(let i=0;i<qtd.value;i++){
        lista.innerHTML+=`<input class="p" oninput="this.value=this.value.toUpperCase()">`;
    }
};

let pessoas=[], meses=[], usados=[];

window.preparar = ()=>{
    pessoas=[...document.querySelectorAll(".p")].map(e=>e.value);
    meses=gerarMeses(inicio.value,fim.value);
    usados=[];
    historico.innerHTML="";
};

window.sortear = async ()=>{
    if(usados.length === pessoas.length){
        alert("Finalizado");
        return;
    }

    let sorteado = sortearItem(pessoas, usados);
    let mes = meses[usados.length];

    usados.push(sorteado);

    historico.innerHTML += `<p>${mes} → ${sorteado}</p>`;

    await addDoc(collection(db,"sorteios"),{
        nome:nome.value,
        pessoa:sorteado,
        mes:mes,
        uid:auth.currentUser.uid
    });

    confetti();
};

/* PRINT */
window.gerarImagem = async ()=>{
    let canvas = await html2canvas(areaPrint);
    let link = document.createElement("a");
    link.download="sorteio.png";
    link.href=canvas.toDataURL();
    link.click();
};

window.enviarWhats = ()=>{
    window.open("https://wa.me/?text=" + encodeURIComponent(historico.innerText));
};