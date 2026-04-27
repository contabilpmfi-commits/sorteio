import { auth, db } from "./firebase.js";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* LOGIN */
window.login = async ()=>{
    try{
        await signInWithEmailAndPassword(auth,user.value,pass.value);
    }catch{
        await createUserWithEmailAndPassword(auth,user.value,pass.value);
    }
};

onAuthStateChanged(auth,(u)=>{
    document.getElementById("loginBox").style.display = u ? "none":"block";
    document.getElementById("app").style.display = u ? "block":"none";
});

window.logout = ()=> signOut(auth);

/* PARTICIPANTES */
window.gerar = ()=>{
    lista.innerHTML="";
    for(let i=0;i<qtd.value;i++){
        lista.innerHTML+=`<input class="p" oninput="this.value=this.value.toUpperCase()">`;
    }
};

/* GERAR MESES (CORRIGIDO) */
function gerarMeses(inicio, fim){

    let meses = [];

    let [anoI, mesI] = inicio.split("-");
    let [anoF, mesF] = fim.split("-");

    let data = new Date(anoI, mesI - 1, 1);
    let fimDate = new Date(anoF, mesF - 1, 1);

    while(data <= fimDate){
        meses.push(
            data.toLocaleDateString('pt-BR',{
                month:'long',
                year:'numeric'
            })
        );

        data.setMonth(data.getMonth() + 1);
    }

    return meses;
}

/* SORTEIO */
function sortearItem(lista, usados){
    let disponiveis = lista.filter(p=>!usados.includes(p));
    return disponiveis[Math.floor(Math.random()*disponiveis.length)];
}

let pessoas=[], meses=[], usados=[];

/* INICIAR */
window.preparar = ()=>{
    pessoas=[...document.querySelectorAll(".p")].map(e=>e.value);
    meses=gerarMeses(inicio.value,fim.value);
    usados=[];
    historico.innerHTML="";
    tituloPrint.innerText = nome.value;
};

/* SORTEAR */
window.sortear = async ()=>{
    if(usados.length === pessoas.length){
        alert("Todos já foram sorteados!");
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

    confetti({particleCount:100,spread:70});
};

/* IMAGEM */
window.gerarImagem = async ()=>{
    let canvas = await html2canvas(document.getElementById("areaPrint"));
    let link = document.createElement("a");
    link.download="sorteio.png";
    link.href=canvas.toDataURL();
    link.click();
};

/* WHATS */
window.enviarWhats = ()=>{
    window.open("https://wa.me/?text=" + encodeURIComponent(historico.innerText));
};
