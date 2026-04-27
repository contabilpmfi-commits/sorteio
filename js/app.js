import { auth } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* TROCA DE TELA */
function mostrar(id){
    ["login","dashboard","cadastro","sorteio"].forEach(t=>{
        document.getElementById(t).classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
}

/* LOGIN */
window.login = async ()=>{
    try{
        await signInWithEmailAndPassword(auth, email.value, senha.value);
    }catch(err){
        alert("Erro: " + err.code);
    }
};

window.logout = ()=> signOut(auth);

onAuthStateChanged(auth,(u)=>{
    if(u){
        mostrar("dashboard");
    } else {
        mostrar("login");
    }
});

/* ✅ GERAR PARTICIPANTES (CORRIGIDO) */
window.gerarParticipantes = ()=>{
    participantes.innerHTML="";
    for(let i=0;i<qtd.value;i++){
        participantes.innerHTML+=`<input class="p" placeholder="Nome ${i+1}">`;
    }
};

/* SALVAR */
window.salvarConsorcio = ()=>{
    alert("Salvo (mock)");
};

/* SORTEIO */
window.sortear = ()=>{
    nomeSorteado.innerText="SORTEADO!";
    mesSorteado.innerText="Contemplado 🎉";
};

/* NAV */
window.abrirCadastro = ()=>mostrar("cadastro");
window.voltar = ()=>mostrar("dashboard");

/* SERVICE WORKER (desliga por enquanto) */
// navigator.serviceWorker.register("./sw.js");
