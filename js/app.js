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
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ================= ESTADO ================= */

let consorcios = [];
let atual = null;
let atualId = null;

/* ================= UI ================= */

function esconderTudo(){
    ["login","dashboard","cadastro","consorcio"].forEach(t=>{
        document.getElementById(t).classList.add("hidden");
    });
}

function mostrar(id){
    esconderTudo();
    document.getElementById(id).classList.remove("hidden");

    if(id === "login"){
        header.classList.add("hidden");
    } else {
        header.classList.remove("hidden");
    }
}

/* ================= LOGIN ================= */

window.login = async ()=>{
    try{
        await signInWithEmailAndPassword(auth,email.value,senha.value);
    }catch(e){
        alert("Erro: " + e.code);
    }
};

window.logout = ()=> signOut(auth);

/* ================= AUTENTICAÇÃO ================= */

onAuthStateChanged(auth,(user)=>{

    // 🔒 desbloqueia UI só depois do Firebase responder
    document.body.classList.remove("loading");

    // 🔥 limpa tudo sempre
    ["login","dashboard","cadastro","consorcio"].forEach(t=>{
        document.getElementById(t).classList.add("hidden");
    });

    if(user){

        userEmail.innerText = user.email;

        header.classList.remove("hidden");

        document.getElementById("dashboard").classList.remove("hidden");

        carregar();

    } else {

        userEmail.innerText = "";

        header.classList.add("hidden");

        document.getElementById("login").classList.remove("hidden");
    }
});
/* ================= LISTAR ================= */

async function carregar(){

    listaConsorcios.innerHTML = "";

    let q = query(
        collection(db,"consorcios"),
        where("uid","==",auth.currentUser.uid)
    );

    let snap = await getDocs(q);

    consorcios = [];

    snap.forEach(docSnap=>{
        consorcios.push({
            id:docSnap.id,
            ...docSnap.data()
        });
    });

    consorcios.forEach(c=>{
        listaConsorcios.innerHTML += `
            <div class="card-item" onclick="abrir('${c.id}')">
                <b>${c.nome}</b><br>
                <small>${c.inicio} → ${c.fim}</small>
            </div>
        `;
    });
}

/* ================= ABRIR ================= */

window.abrir = async (id)=>{

    atualId = id;

    let snap = await getDoc(doc(db,"consorcios",id));
    atual = snap.data();

    if(!atual.sorteios) atual.sorteios = [];

    titulo.innerText = atual.nome;

    renderTabela();

    mostrar("consorcio");
};

/* ================= CADASTRO ================= */

window.gerarParticipantes = ()=>{
    participantes.innerHTML="";

    for(let i=0;i<qtd.value;i++){
        participantes.innerHTML += `
            <input class="p" placeholder="Nome ${i+1}" 
            oninput="this.value=this.value.toUpperCase()">
        `;
    }
};

window.salvarConsorcio = async ()=>{

    let nomes = [...document.querySelectorAll(".p")].map(e=>e.value);

    if(nomes.length === 0){
        alert("Preencha participantes");
        return;
    }

    await addDoc(collection(db,"consorcios"),{
        nome:nome.value,
        pessoas:nomes,
        inicio:inicio.value,
        fim:fim.value,
        sorteios:[],
        uid:auth.currentUser.uid
    });

    alert("Salvo!");

    mostrar("dashboard");
    carregar();
};

/* ================= MESES ================= */

function gerarMeses(i,f){

    let meses=[];
    let d=new Date(i);
    let fim=new Date(f);

    while(d<=fim){
        meses.push(
            d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'})
        );
        d.setMonth(d.getMonth()+1);
    }

    return meses;
}

/* ================= TABELA ================= */

function renderTabela(){

    let meses = gerarMeses(atual.inicio,atual.fim);

    tabela.innerHTML="";

    meses.forEach((mes,i)=>{

        let pessoa = atual.sorteios[i]?.pessoa || "";

        tabela.innerHTML += `
        <div class="linha-tabela">

            <span>${mes}</span>

            <select onchange="salvarManual(${i},this.value)">
                <option value="">--</option>
                ${atual.pessoas.map(p=>
                    `<option ${p===pessoa?"selected":""}>${p}</option>`
                ).join("")}
            </select>

        </div>
        `;
    });
}

/* ================= SORTEIO ================= */

window.sortear = async ()=>{

    let usados = atual.sorteios.map(s=>s.pessoa);

    let livres = atual.pessoas.filter(p=>!usados.includes(p));

    if(livres.length === 0){
        alert("Todos já foram sorteados");
        return;
    }

    let i = atual.sorteios.length;

    let pessoa = livres[Math.floor(Math.random()*livres.length)];

    atual.sorteios[i] = { pessoa };

    await salvar();
};

/* ================= MANUAL ================= */

window.salvarManual = async (i,pessoa)=>{

    atual.sorteios[i] = { pessoa };

    await salvar();
};

/* ================= SALVAR ================= */

async function salvar(){

    await updateDoc(doc(db,"consorcios",atualId),{
        sorteios:atual.sorteios
    });

    renderTabela();
}

/* ================= RESET ================= */

window.resetar = async ()=>{

    if(!confirm("Resetar sorteio?")) return;

    atual.sorteios = [];

    await salvar();
};

/* ================= EXCLUIR ================= */

window.excluir = async ()=>{

    if(!confirm("Excluir consórcio?")) return;

    await deleteDoc(doc(db,"consorcios",atualId));

    alert("Excluído!");

    mostrar("dashboard");
    carregar();
};

/* ================= EXTRATO ================= */

window.gerarImagem = async ()=>{

    tituloImagem.innerText = atual.nome;

    listaImagem.innerHTML="";

    atual.sorteios.forEach((s,i)=>{
        listaImagem.innerHTML += `
            <div>${s.mes || (i+1)+"º mês"} → <b>${s.pessoa}</b></div>
        `;
    });

    areaImagem.classList.remove("hidden");

    let canvas = await html2canvas(areaImagem);

    areaImagem.classList.add("hidden");

    let link=document.createElement("a");
    link.download="extrato.png";
    link.href=canvas.toDataURL();
    link.click();
};

/* ================= NAV ================= */

window.abrirCadastro = ()=>mostrar("cadastro");
window.voltar = ()=>mostrar("dashboard");
