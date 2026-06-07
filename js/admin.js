let semuaDataAdmin = [];
let dataTampilAdmin = [];
let halamanAdmin = 1;
let jumlahPerHalamanAdmin = 10;

let kolomSortAdmin = "nama";
let arahSortAdmin = "asc";

document.addEventListener("DOMContentLoaded", () => {
  cekLoginAdmin();

  document
    .getElementById("searchAdmin")
    .addEventListener("input", prosesFilterAdmin);

  document
    .getElementById("filterKecamatanAdmin")
    .addEventListener("change", prosesFilterAdmin);

  document
    .getElementById("pageSizeAdmin")
    .addEventListener("change", function () {
      jumlahPerHalamanAdmin = Number(this.value);
      halamanAdmin = 1;
      tampilkanTabelAdmin();
    });

  document
    .getElementById("prevPageAdmin")
    .addEventListener("click", halamanSebelumnyaAdmin);

  document
    .getElementById("nextPageAdmin")
    .addEventListener("click", halamanBerikutnyaAdmin);
});

function cekLoginAdmin() {
  const login = sessionStorage.getItem("adminLogin");

  if (login === "true") {
    tampilkanDataAdmin();
  }
}

async function loginAdmin() {
  const username = document.getElementById("usernameAdmin").value.trim();
  const password = document.getElementById("passwordAdmin").value.trim();
  const info = document.getElementById("loginInfo");

  if (!username || !password) {
    info.textContent = "Username dan password wajib diisi";
    return;
  }

  info.textContent = "Memeriksa login...";

  try {
    const hasil = await ambilJSONP(
      `${API_URL}?mode=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    );

    if (!hasil.success) {
      info.textContent = "Username atau password salah";
      return;
    }

sessionStorage.setItem("adminLogin", "true");
sessionStorage.setItem("adminUser", username);
sessionStorage.setItem("adminPass", password);
tampilkanDataAdmin();

  } catch (error) {
    console.log("ERROR LOGIN ADMIN:", error);
    info.textContent = "Gagal login. Periksa koneksi atau Apps Script.";
  }
}

async function tampilkanDataAdmin() {
  const loginBox = document.getElementById("loginBox");
  const adminBox = document.getElementById("adminBox");
  const tbody = document.getElementById("adminBody");

  loginBox.style.display = "none";
  adminBox.style.display = "block";

  tbody.innerHTML = `
    <tr>
      <td colspan="5">Memuat data admin...</td>
    </tr>
  `;

  try {
const username = sessionStorage.getItem("adminUser");
const password = sessionStorage.getItem("adminPass");
const hasil = await ambilJSONP(
  `${API_URL}?mode=admin&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
);

    semuaDataAdmin = hasil.data || [];
    dataTampilAdmin = [...semuaDataAdmin];

    isiFilterKecamatanAdmin();
    urutkanDataAdmin();
    tampilkanTabelAdmin();

  } catch (error) {
    console.log("ERROR ADMIN:", error);

    tbody.innerHTML = `
      <tr>
        <td colspan="5">Gagal memuat data admin</td>
      </tr>
    `;
  }
}

function isiFilterKecamatanAdmin() {
  const select = document.getElementById("filterKecamatanAdmin");

  select.innerHTML = `
    <option value="">Semua Kecamatan</option>
  `;

  const daftarKecamatan = [
    ...new Set(
      semuaDataAdmin
        .map(item => kapital(item.kecamatan))
        .filter(kec => kec !== "")
    )
  ].sort();

  daftarKecamatan.forEach(kecamatan => {
    const option = document.createElement("option");
    option.value = kecamatan;
    option.textContent = kecamatan;
    select.appendChild(option);
  });
}

function prosesFilterAdmin() {
  const keyword = kecil(
    document.getElementById("searchAdmin").value
  );

  const kecamatanDipilih =
    document.getElementById("filterKecamatanAdmin").value;

  dataTampilAdmin = semuaDataAdmin.filter(item => {
    const nama = kecil(item.nama);

    const cocokKeyword =
      nama.includes(keyword);

    const cocokKecamatan =
      kecamatanDipilih === "" ||
      kapital(item.kecamatan) === kecamatanDipilih;

    return cocokKeyword && cocokKecamatan;
  });

  halamanAdmin = 1;
  urutkanDataAdmin();
  tampilkanTabelAdmin();
}

function sortKolomAdmin(kolom) {
  if (kolomSortAdmin === kolom) {
    arahSortAdmin = arahSortAdmin === "asc" ? "desc" : "asc";
  } else {
    kolomSortAdmin = kolom;
    arahSortAdmin = "asc";
  }

  urutkanDataAdmin();
  halamanAdmin = 1;
  tampilkanTabelAdmin();
}

function urutkanDataAdmin() {
  dataTampilAdmin.sort((a, b) => {
    const nilaiA = kecil(a[kolomSortAdmin]);
    const nilaiB = kecil(b[kolomSortAdmin]);

    return arahSortAdmin === "asc"
      ? nilaiA.localeCompare(nilaiB, "id", { numeric: true })
      : nilaiB.localeCompare(nilaiA, "id", { numeric: true });
  });
}

function tampilkanTabelAdmin() {
  const tbody = document.getElementById("adminBody");
  const pageInfo = document.getElementById("pageInfoAdmin");

  tbody.innerHTML = "";

  const totalData = dataTampilAdmin.length;
  const totalHalaman =
    Math.ceil(totalData / jumlahPerHalamanAdmin) || 1;

  if (halamanAdmin > totalHalaman) {
    halamanAdmin = totalHalaman;
  }

  const mulai = (halamanAdmin - 1) * jumlahPerHalamanAdmin;
  const akhir = mulai + jumlahPerHalamanAdmin;
  const dataHalaman = dataTampilAdmin.slice(mulai, akhir);

  if (dataHalaman.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">Data tidak ditemukan</td>
      </tr>
    `;
  }

  dataHalaman.forEach(item => {
    const tr = document.createElement("tr");

tr.innerHTML = `
  <td data-label="SobatID">${item.sobatId}</td>
  <td data-label="Nama">${kapital(item.nama)}</td>
  <td data-label="Kecamatan">${kapital(item.kecamatan)}</td>
  <td data-label="Email">${kecil(item.email)}</td>
  <td data-label="Nomor HP">${item.hp}</td>
`;

    tbody.appendChild(tr);
  });

  pageInfo.textContent =
    `Halaman ${halamanAdmin} dari ${totalHalaman} | Total ${totalData} data`;

  document.getElementById("prevPageAdmin").disabled =
    halamanAdmin <= 1;

  document.getElementById("nextPageAdmin").disabled =
    halamanAdmin >= totalHalaman;
}

function halamanSebelumnyaAdmin() {
  if (halamanAdmin > 1) {
    halamanAdmin--;
    tampilkanTabelAdmin();
  }
}

function halamanBerikutnyaAdmin() {
  const totalHalaman =
    Math.ceil(dataTampilAdmin.length / jumlahPerHalamanAdmin) || 1;

  if (halamanAdmin < totalHalaman) {
    halamanAdmin++;
    tampilkanTabelAdmin();
  }
}

function logoutAdmin() {
  sessionStorage.removeItem("adminLogin");
  sessionStorage.removeItem("adminUser");
  sessionStorage.removeItem("adminPass");

  location.reload();
}

function ambilJSONP(url) {
  return new Promise((resolve, reject) => {
    const callbackName = "jsonpCallback_" + Date.now();

    window[callbackName] = function (data) {
      delete window[callbackName];
      script.remove();
      resolve(data);
    };

    const script = document.createElement("script");
    script.src = url + "&callback=" + callbackName;

    script.onerror = function () {
      delete window[callbackName];
      script.remove();
      reject(new Error("Gagal memuat data JSONP"));
    };

    document.body.appendChild(script);
  });
}
