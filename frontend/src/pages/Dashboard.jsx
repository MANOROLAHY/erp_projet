import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function Dashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showProducts, setShowProducts] = useState(true);
  const [showForm, setShowForm] = useState(true);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/refresh/",
        {
          refresh: localStorage.getItem("refresh"),
        }
      );

      localStorage.setItem("access", response.data.access);

      return response.data.access;
    } catch {
      logout();
    }
  };

  const fetchProducts = () => {
    setLoading(true);

    axios
      .get("http://127.0.0.1:8000/api/products/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      })
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  };

  const addProduct = async () => {
    setLoading(true);

    const url = editId
      ? `http://127.0.0.1:8000/api/products/${editId}/`
      : "http://127.0.0.1:8000/api/products/";

    const method = editId ? axios.put : axios.post;

    try {
      await method(
        url,
        {
          name,
          description,
          price,
          quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      fetchProducts();

      setName("");
      setDescription("");
      setPrice("");
      setQuantity("");
      setEditId(null);

      Swal.fire({
        title: editId
          ? "Produit modifié"
          : "Produit ajouté",
        text: editId
          ? "Modification effectuée avec succès"
          : "Ajout effectué avec succès",
        icon: "success",
        confirmButtonColor: "#22c55e",
        borderRadius: "20px",
      });

    } catch (error) {

      if (error.response?.data?.code === "token_not_valid") {

        const newToken = await refreshToken();

        await method(
          url,
          {
            name,
            description,
            price,
            quantity,
          },
          {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          }
        );

        fetchProducts();

      } else {

        Swal.fire({
          title: "Erreur",
          text: "Erreur lors de l'opération",
          icon: "error",
          confirmButtonColor: "#ef4444",
          borderRadius: "20px",
        });

      }

    } finally {
      setLoading(false);
    }
  };

  const editProduct = async (p) => {

    const result = await Swal.fire({
      title: "Modifier ce produit ?",
      text: "Le formulaire sera rempli automatiquement",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Continuer",
      cancelButtonText: "Annuler",
      borderRadius: "20px",
    });

    if (!result.isConfirmed) return;

    setEditId(p.id);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setQuantity(p.quantity);

    setShowForm(true);
  };

  const deleteProduct = async (id) => {

    const result = await Swal.fire({
      title: "Supprimer le produit ?",
      text: "Cette action est irréversible",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Supprimer",
      cancelButtonText: "Annuler",
      background: "#ffffff",
      borderRadius: "20px",
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    axios
      .delete(`http://127.0.0.1:8000/api/products/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
        },
      })
      .then(() => {

        fetchProducts();

        Swal.fire({
          title: "Supprimé !",
          text: "Produit supprimé avec succès",
          icon: "success",
          confirmButtonColor: "#22c55e",
          borderRadius: "20px",
        });

      })
      .finally(() => setLoading(false));
  };

  const exportPDF = () => {

    const doc = new jsPDF();

    doc.text("Liste des produits", 20, 20);

    let y = 40;

    products.forEach((p, i) => {

      doc.text(
        `${i + 1}. ${p.name} | ${p.price} Ar | Stock: ${p.quantity}`,
        20,
        y
      );

      y += 10;

    });

    doc.save("produits.pdf");
  };

  const exportExcel = () => {

    const ws = XLSX.utils.json_to_sheet(products);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Produits");

    XLSX.writeFile(wb, "produits.xlsx");
  };

  useEffect(() => {

    if (!localStorage.getItem("access")) {
      navigate("/");
    }

    fetchProducts();

  }, []);

  const totalStock = products.reduce(
    (t, p) => t + Number(p.quantity),
    0
  );

  const totalValue = products.reduce(
    (t, p) => t + Number(p.price) * Number(p.quantity),
    0
  );

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const colors = [
    "#3b82f6",
    "#22c55e",
    "#eab308",
    "#ef4444",
    "#8b5cf6",
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      <ToastContainer position="top-right" autoClose={2000} />

      {/* SIDEBAR */}
      <div className="w-52 bg-white shadow-xl p-4">

        <h1 className="text-4xl font-bold text-blue-600 mb-10">
          ERP Admin
        </h1>

        <ul className="space-y-5 text-lg">

          <li className="hover:text-blue-600 cursor-pointer transition">
            📊 Dashboard
          </li>

          <li className="hover:text-blue-600 cursor-pointer transition">
            📦 Produits
          </li>

          <li className="hover:text-blue-600 cursor-pointer transition">
            📈 Statistique
          </li>

          <li className="hover:text-blue-600 cursor-pointer transition">
            👥 Utilisateurs
          </li>

        </ul>

        <button
          onClick={logout}
          className="mt-10 w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl text-base shadow-md"
        >
          Déconnexion
        </button>

      </div>

      {/* CONTENU */}
      <div className="flex-1 p-5">

        {/* TITRE */}
        <h1 className="text-5xl font-bold text-center text-blue-600 mb-8">
          ERP Dashboard
        </h1>

        {/* LOADING */}
        {loading && (
          <div className="text-center text-blue-600 text-xl font-bold mb-5">
            Chargement...
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-between items-center mb-6">

          <div className="flex gap-3">

            <button
              onClick={exportPDF}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl shadow-md text-sm"
            >
              Exporter PDF
            </button>

            <button
              onClick={exportExcel}
              className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl shadow-md text-sm"
            >
              Exporter Excel
            </button>

          </div>

          <input
            type="text"
            placeholder="🔍 Rechercher un produit..."
            className="w-72 p-3 rounded-full border shadow-md outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {/* BOUTONS */}
        <div className="flex gap-4 mb-8">

          <button
            onClick={() => setShowProducts(!showProducts)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md text-sm"
          >
            📦 Liste Produits
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl shadow-md text-sm"
          >
            ➕ Ajouter / Modifier
          </button>

        </div>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">

          {/* LISTE PRODUITS */}
          {showProducts && (
            <div>

              <h2 className="text-3xl font-bold text-blue-600 mb-5">
                Liste des produits
              </h2>

              <div className="grid md:grid-cols-2 gap-4">

                {filteredProducts.map((p) => (

                  <div
                    key={p.id}
                    className="bg-white p-5 rounded-2xl shadow-lg hover:shadow-xl transition duration-300"
                  >

                    <h2 className="text-xl font-bold text-blue-600 mb-2">
                      {p.name}
                    </h2>

                    <p className="text-gray-600 text-sm mb-2">
                      {p.description}
                    </p>

                    <p className="text-green-600 font-bold text-sm">
                      Prix : {p.price} Ar
                    </p>

                    <p className="text-yellow-600 font-bold text-sm mb-4">
                      Stock : {p.quantity}
                    </p>

                    <div className="flex gap-2">

                      <button
                        onClick={() => editProduct(p)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Modifier
                      </button>

                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Supprimer
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>
          )}

          {/* FORMULAIRE */}
          {showForm && (
            <div className="bg-white p-6 rounded-2xl shadow-xl h-fit max-w-md">

              <h2 className="text-4xl font-bold text-blue-600 mb-6">
                {editId
                  ? "Modifier Produit"
                  : "Ajouter Produit"}
              </h2>

              <input
                type="text"
                placeholder="Nom"
                className="w-full p-3 mb-4 border rounded-xl outline-none text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Description"
                className="w-full p-3 mb-4 border rounded-xl outline-none text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <input
                type="number"
                placeholder="Prix"
                className="w-full p-3 mb-4 border rounded-xl outline-none text-sm"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />

              <input
                type="number"
                placeholder="Quantité"
                className="w-full p-3 mb-4 border rounded-xl outline-none text-sm"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />

              <button
                onClick={addProduct}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-base shadow-md"
              >
                {editId
                  ? "Mettre à jour"
                  : "Ajouter Produit"}
              </button>

            </div>
          )}

        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">

          <div className="bg-blue-500 text-white p-5 rounded-2xl shadow-lg">
            <h2 className="text-xl">Produits</h2>
            <p className="text-4xl font-bold">
              {products.length}
            </p>
          </div>

          <div className="bg-green-500 text-white p-5 rounded-2xl shadow-lg">
            <h2 className="text-xl">Stock</h2>
            <p className="text-4xl font-bold">
              {totalStock}
            </p>
          </div>

          <div className="bg-purple-500 text-white p-5 rounded-2xl shadow-lg">
            <h2 className="text-xl">Valeur Totale</h2>
            <p className="text-3xl font-bold">
              {totalValue} Ar
            </p>
          </div>

        </div>

        {/* GRAPHIQUES */}
        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-white p-5 rounded-2xl shadow-lg h-80">

            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              Graphique du stock
            </h2>

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={products}>

                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="quantity"
                  fill="#3b82f6"
                  radius={[10, 10, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

          <div className="bg-white p-5 rounded-2xl shadow-lg h-80">

            <h2 className="text-2xl font-bold text-blue-600 mb-4">
              Répartition du stock
            </h2>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>

                <Pie
                  data={products}
                  dataKey="quantity"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {products.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />
                <Legend />

              </PieChart>
            </ResponsiveContainer>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Dashboard; 