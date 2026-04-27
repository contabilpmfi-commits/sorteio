import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* NAV */
function tela(id){
    document.querySelectorAll(".tela").forEach(t=>t.classList.remove("ativa"));
    document.getElementById(id).classList.add("ativa");
}

/* LOGIN */
window.login = async ()=>{
    try{
        await signInWithEmailAndPassword(auth,email.value,senha.value);
    }catch{
        await createUserWithEmailAndPassword(auth,email.value,senha.value);
    }
};

window.logout = ()=> signOut(auth);

onAuthStateChanged(auth,(u)=>{
    if(u){
        tela("dashboard");
        carregarConsorcios();
    } else {
        tela("login");
    }
});

/* GERAR PARTICIPANTES */
window.gerarParticipantes = ()=>{
    participantes.innerHTML="";
    for(let i=0;i<qtd.value;i++){
        participantes.innerHTML+=`<input class="p">`;
    }
};

/* SALVAR */
window.salvarConsorcio = async ()=>{

    let nomes=[...document.querySelectorAll(".p")].map(e=>e.value);

    await addDoc(collection(db,"consorcios"),{
        nome:nome.value,
        pessoas:nomes,
        inicio:inicio.value,
        fim:fim.value,
        uid:auth.currentUser.uid,
        manual: manual.checked
    });

    alert("Consórcio cadastrado com sucesso!");

    tela("dashboard");
    carregarConsorcios();
};

/* LISTAR */
async function carregarConsorcios(){

    let q=query(collection(db,"consorcios"),
        where("uid","==",auth.currentUser.uid));

    let snap=await getDocs(q);

    listaConsorcios.innerHTML="";

    snap.forEach(docSnap=>{
        let d=docSnap.data();

        listaConsorcios.innerHTML+=`
            <div class="card">
                <b>${d.nome}</b><br>
                ${d.manual ? "📌 Importado" : "🎲 Sorteio"}
                <br>

                <button onclick="abrirSorteio('${docSnap.id}')">Abrir</button>
                <button onclick="excluir('${docSnap.id}')">Excluir</button>
            </div>
        `;
    });
}

/* EXCLUIR */
window.excluir = async (id)=>{
    if(confirm("Excluir consórcio?")){
        await deleteDoc(doc(db,"consorcios",id));
        carregarConsorcios();
    }
};

/* SORTEIO */
let atual=null, usados=[], meses=[];

window.abrirSorteio = async (id)=>{

    let snap=await getDocs(collection(db,"consorcios"));

    snap.forEach(docSnap=>{
        if(docSnap.id===id){
            atual=docSnap.data();
        }
    });

    meses=gerarMeses(atual.inicio,atual.fim);
    usados=[];

    titulo.innerText=atual.nome;

    tela("sorteio");
};

function gerarMeses(inicio,fim){
    let meses=[];
    let [a,m]=inicio.split("-");
    let [af,mf]=fim.split("-");
    let d=new Date(a,m-1,1);
    let f=new Date(af,mf-1,1);

    while(d<=f){
        meses.push(d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}));
        d.setMonth(d.getMonth()+1);
    }
    return meses;
}

window.sortear = ()=>{

    let disp=atual.pessoas.filter(p=>!usados.includes(p));

    let sorteado=disp[Math.floor(Math.random()*disp.length)];

    let mes=meses[usados.length];

    usados.push(sorteado);

    nomeSorteado.innerText=sorteado;
    mesSorteado.innerText="Contemplado(a) em "+mes;

    confetti();
};

/* EXPORTAR */
window.exportarTexto = ()=>{
    let texto = atual.nome + "\n\n";

    usados.forEach((p,i)=>{
        texto += `${meses[i]} → ${p}\n`;
    });

    navigator.clipboard.writeText(texto);

    alert("Copiado!");
};

/* NAV */
window.abrirCadastro=()=>tela("cadastro");
window.voltar=()=>tela("dashboard");
