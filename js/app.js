/* RESETAR */
window.resetar = async ()=>{
    if(!confirm("Resetar sorteio?")) return;

    atual.sorteios = [];

    await updateDoc(doc(db,"consorcios",atualId),{
        sorteios:[]
    });

    render();
};

/* EXCLUIR */
window.excluir = async ()=>{
    if(!confirm("Excluir consórcio?")) return;

    await deleteDoc(doc(db,"consorcios",atualId));

    alert("Excluído!");

    mostrar("dashboard");
    carregar();
};
