import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* TELAS */
function mostrar(id){
    ["login","dashboard","cadastro","sorteio"].forEach(t=>{
        document.getElementById(t).classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
}

/* LOGIN */
window.login = async ()=>{
    await signInWithEmailAndPassword(auth,email.value,senha.value);
};

window.logout = ()=> signOut(auth);

onAuthStateChanged(auth,(u)=>{
    if(u){
        mostrar("dashboard");
        carregar();
    } else {
        mostrar("login");
    }
});

/* PARTICIPANTES */
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
        sorteios:[]
    });

    mostrar("dashboard");
    carregar();
};

/* LISTAR */
async function carregar(){

    let q=query(collection(db,"consorcios"),
        where("uid","==",auth.currentUser.uid));

    let snap=await getDocs(q);

    listaConsorcios.innerHTML="";

    snap.forEach(docSnap=>{
        let d=docSnap.data();

        listaConsorcios.innerHTML+=`
            <div class="item">
                ${d.nome}
                <button onclick="abrir('${docSnap.id}')">Abrir</button>
            </div>
        `;
    });
}

/* ABRIR */
let atual=null;
let atualId=null;

window.abrir = async (id)=>{

    atualId=id;

    let snap=await getDoc(doc(db,"consorcios",id));
    atual=snap.data();

    titulo.innerText=atual.nome;

    if(!atual.sorteios) atual.sorteios=[];

    carregarSelects();
    render();

    mostrar("sorteio");
};

/* MESES */
function gerarMeses(i,f){
    let m=[];
    let d=new Date(i);
    let fim=new Date(f);

    while(d<=fim){
        m.push(d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}));
        d.setMonth(d.getMonth()+1);
    }
    return m;
}

/* SELECTS */
function carregarSelects(){

    manualPessoa.innerHTML="";
    atual.pessoas.forEach(p=>{
        manualPessoa.innerHTML+=`<option>${p}</option>`;
    });

    let meses=gerarMeses(atual.inicio,atual.fim);

    manualMes.innerHTML="";
    meses.forEach(m=>{
        manualMes.innerHTML+=`<option>${m}</option>`;
    });
}

/* SORT */
window.sortear = async ()=>{

    let meses=gerarMeses(atual.inicio,atual.fim);

    let usados=atual.sorteios.map(s=>s.pessoa);
    let livres=atual.pessoas.filter(p=>!usados.includes(p));

    if(livres.length===0) return alert("Finalizado");

    let p=livres[Math.floor(Math.random()*livres.length)];
    let mes=meses[atual.sorteios.length];

    atual.sorteios.push({pessoa:p,mes});

    salvar();
};

/* MANUAL */
window.sortearManual = async ()=>{

    atual.sorteios.push({
        pessoa:manualPessoa.value,
        mes:manualMes.value
    });

    salvar();
};

/* SALVAR SORTEIO */
async function salvar(){

    await updateDoc(doc(db,"consorcios",atualId),{
        sorteios:atual.sorteios
    });

    render();
}

/* HISTÓRICO */
function render(){

    historico.innerHTML="";

    atual.sorteios.forEach(s=>{
        historico.innerHTML+=`
            <div class="item">
                <b>${s.mes}</b> → ${s.pessoa}
            </div>
        `;
    });
}

/* IMAGEM */
window.gerarImagem = async ()=>{
    let canvas = await html2canvas(historico);
    let link=document.createElement("a");
    link.download="extrato.png";
    link.href=canvas.toDataURL();
    link.click();
};

/* NAV */
window.abrirCadastro=()=>mostrar("cadastro");
window.voltar=()=>mostrar("dashboard");
