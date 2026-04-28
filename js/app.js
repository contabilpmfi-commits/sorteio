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
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ===== TELA ===== */

function setTela(tela){

    ["login","dashboard","cadastro","consorcio"].forEach(id=>{
        document.getElementById(id).style.display="none";
    });

    document.getElementById(tela).style.display="block";

    header.style.display = tela === "login" ? "none":"flex";
}

/* ===== LOGIN ===== */

window.login = async ()=>{
    try{
        await signInWithEmailAndPassword(auth,email.value,senha.value);
    }catch(e){
        alert("Erro login: " + e.code);
    }
};

window.logout = ()=> signOut(auth);

/* ===== AUTH ===== */

onAuthStateChanged(auth,(user)=>{

    if(user){
        userEmail.innerText = user.email;
        setTela("dashboard");
        carregar();
    }else{
        setTela("login");
    }
});

/* ===== DADOS ===== */

let atual=null;
let atualId=null;

/* ===== LISTAR (COMPARTILHADO) ===== */

async function carregar(){

    let snap = await getDocs(collection(db,"consorcios"));

    listaConsorcios.innerHTML="";

    snap.forEach(docSnap=>{
        let d = docSnap.data();

        listaConsorcios.innerHTML+=`
        <div class="card-item" onclick="abrir('${docSnap.id}')">
            <b>${d.nome}</b><br>
            <small>${d.inicio} → ${d.fim}</small>
        </div>
        `;
    });
}

/* ===== ABRIR ===== */

window.abrir = async (id)=>{
    atualId=id;

    let snap = await getDoc(doc(db,"consorcios",id));
    atual=snap.data();

    if(!atual.sorteios) atual.sorteios=[];

    titulo.innerText=atual.nome;

    renderTabela();

    setTela("consorcio");
};

/* ===== CADASTRO ===== */

window.gerarParticipantes = ()=>{
    participantes.innerHTML="";
    for(let i=0;i<qtd.value;i++){
        participantes.innerHTML+=`<input class="p">`;
    }
};

window.salvarConsorcio = async ()=>{

    let nomes=[...document.querySelectorAll(".p")].map(e=>e.value);

    await addDoc(collection(db,"consorcios"),{
        nome:nome.value,
        pessoas:nomes,
        inicio:inicio.value,
        fim:fim.value,
        sorteios:[]
    });

    alert("Salvo!");

    setTela("dashboard");
    carregar();
};

/* ===== MESES ===== */

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

/* ===== TABELA ===== */

function renderTabela(){

    let meses=gerarMeses(atual.inicio,atual.fim);

    tabela.innerHTML="";

    meses.forEach((mes,i)=>{
        let p=atual.sorteios[i]?.pessoa || "";

        tabela.innerHTML+=`
        <div class="linha-tabela">
            <span>${mes}</span>

            <select onchange="salvarManual(${i},this.value)">
                <option></option>
                ${atual.pessoas.map(x=>`<option ${x==p?"selected":""}>${x}</option>`).join("")}
            </select>
        </div>
        `;
    });
}

/* ===== SORTEIO ===== */

window.sortear = async ()=>{
    let usados=atual.sorteios.map(s=>s.pessoa);
    let livres=atual.pessoas.filter(p=>!usados.includes(p));

    if(livres.length===0) return alert("Finalizado");

    atual.sorteios.push({
        pessoa:livres[Math.floor(Math.random()*livres.length)]
    });

    salvar();
};

window.salvarManual = async (i,pessoa)=>{
    atual.sorteios[i]={pessoa};
    salvar();
};

async function salvar(){
    await updateDoc(doc(db,"consorcios",atualId),{
        sorteios:atual.sorteios
    });
    renderTabela();
}

/* ===== RESET ===== */

window.resetar = async ()=>{
    if(!confirm("Resetar?")) return;
    atual.sorteios=[];
    salvar();
};

/* ===== EXCLUIR ===== */

window.excluir = async ()=>{
    if(!confirm("Excluir?")) return;

    await deleteDoc(doc(db,"consorcios",atualId));

    alert("Excluído");

    setTela("dashboard");
    carregar();
};

/* ===== EXTRATO ===== */

window.gerarImagem = async ()=>{

    tituloImagem.innerText = atual.nome;
    listaImagem.innerHTML="";

    atual.sorteios.forEach((s,i)=>{
        listaImagem.innerHTML+=`
            <div>${i+1}º mês → <b>${s.pessoa}</b></div>
        `;
    });

    areaImagem.style.display="block";

    let canvas=await html2canvas(areaImagem);

    areaImagem.style.display="none";

    let link=document.createElement("a");
    link.download="extrato.png";
    link.href=canvas.toDataURL();
    link.click();
};

/* ===== NAV ===== */

window.abrirCadastro=()=>setTela("cadastro");
window.voltar=()=>setTela("dashboard");
