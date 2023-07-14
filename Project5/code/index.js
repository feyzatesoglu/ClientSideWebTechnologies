const tableBodyDiv = document.querySelector("#table-body")
const pageNumsDiv = document.querySelector("#pageNums")
const form = document.getElementById('form');
const formItems = form.querySelectorAll('input, select');

const depts = {
    "1": "Bilgisayar Müh.",
    "2": "Elektrik-Elektronik Müh.",
    "3": "Endüstri Müh.",
    "4": "İnşaat Müh."
};

const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmationModal'), {
    keyboard: false
});
const exampleModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
    keyboard: false
});
const nameInput = document.getElementById('nameInput');
const surnameInput = document.getElementById('surnameInput');
const studNoInput = document.getElementById('studNoInput');
const deptInput = document.getElementById('inputGroupSelect01');
const cityInput = document.getElementById('cityInput');
const start = document.getElementById('start');

let id = 0;

(async () => {
    let students = [];

    document.querySelectorAll('input[name="perPage"]').forEach(el => el.addEventListener('change', () => {
        const perPage = document.querySelector('input[name="perPage"]:checked').value;
        const numOfPages = Math.ceil(students.length / perPage);
        renderPageNums(numOfPages, 1);
        renderTable();
    }));

    renderAll();

    const fillStudentFields = (student) => {
        nameInput.value = student.fname;
        surnameInput.value = student.lname;
        studNoInput.value = student.num;
        deptInput.value = student.dept;
        cityInput.value = student.pob;
        start.value = student.dob;
    };

    function renderTable(page) {
        const perPage = document.querySelector('input[name="perPage"]:checked').value;
        const items = [...students].splice((page - 1) * perPage, perPage);

        tableBodyDiv.innerHTML = '';

        // Render the items
        let template = '<tbody>';
        items.forEach(item => {
            template += `
                <tr>
                    <td>${item.fname} ${item.lname}</td>
                    <td>${item.num}</td>
                    <td>${depts[item.dept]}</td>
                    <td><button type="button" class="btn btn-danger delete-student" style="width:5rem;" data-id="${item.id}">Sil</button> 
                    <button class="btn btn-primary edit-student" data-id="${item.id}" type="button" style="width:5rem;">Düzenle</button>
                    <button type="button" class="btn btn-success detail-student" style="width:5rem;" data-id="${item.id}">Detay</button>
                    </td>
                </tr>`;
        })
        template += '</tbody>'
        tableBodyDiv.innerHTML = template;

        document.querySelector('.add-student').addEventListener('click', () => {
            document.querySelector('#exampleModal form').classList.remove('readonly')
            id = 0;
            exampleModal.show();
            form.reset();
        });

        document.querySelectorAll('.detail-student').forEach((el) => {
            el.addEventListener('click', async (e) => {
                const id = el.getAttribute('data-id');
                // this is another way of doing that instead of refetching
                // const student = students.find((student) => student.id === parseInt(id));
                const student = await getStudent(id);
                if (!student) return;

                exampleModal.show();
                document.querySelector('#exampleModal form').classList.add('readonly')

                fillStudentFields(student);
            })
        });

        document.querySelectorAll('.delete-student').forEach((el) => {
            el.addEventListener('click', async (e) => {
                const _id = el.getAttribute('data-id');
                const student = students.find((student) => student.id === parseInt(_id));
                if (!student) return;

                const detailEl = document.getElementById('student-detail');
                detailEl.textContent = `${student.fname} ${student.lname} isimli öğrenciyi siliyorsunuz emin misiniz?`;
                deleteModal.show();
                id = _id;
            })
        });

        document.querySelector('.delete-student-confirm').addEventListener('click', async () => {
            const result = await deleteStudent(id);
            renderAll();
            deleteModal.hide();
        });

        document.querySelectorAll('.edit-student').forEach((el) => {
            el.addEventListener('click', async () => {
                document.querySelector('#exampleModal form').classList.remove('readonly')
                const _id = el.getAttribute('data-id');
                // this is another way of doing that instead of refetching
                // const student = students.find((student) => student.id === parseInt(_id));
                const student = await getStudent(_id);
                if (!student) return;

                exampleModal.show();
                fillStudentFields(student);

                id = _id;
            })
        });
    }

    function renderPageNums(numOfPages, currentPage) {
        let template = '<div>';

        for (let i = 1; i <= numOfPages; i++) {
            template += `<button class="btn page-btn ${i == currentPage ? 'btn-primary' : 'btn-outline-primary'}" data-page="${i}">${i}</button>`;
        }
        template += "</div>"
        pageNumsDiv.innerHTML = template;

        document.querySelectorAll('.page-btn').forEach((el) => {
            el.addEventListener('click', () => {
                const active = document.querySelector('.page-btn.btn-primary')
                active.classList.remove('btn-primary');
                active.classList.add('btn-outline-primary');

                const page = el.getAttribute('data-page');
                el.classList.add('btn-primary');

                renderTable(page);
            })
        })
    }

    async function renderAll() {
        students = await getStudents();
        renderTable();
        const perPage = document.querySelector('input[name="perPage"]:checked').value;
        const numOfPages = Math.ceil(students.length / perPage);
        renderPageNums(numOfPages, 1);
    }

    window.addEventListener('DOMContentLoaded', (e) => {
        renderAll();
    });

    const checkInputValidity = (el) => {
        if (el.checkValidity()) {
            el.classList.remove('is-invalid')
            el.classList.add('is-valid')
        } else {
            el.classList.remove('is-valid')
            el.classList.add('is-invalid')
        }
    };
    formItems.forEach((el) => {
        el.addEventListener('keyup', () => checkInputValidity(el));
        el.addEventListener('change', () => checkInputValidity(el));
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!form.checkValidity()) {
            checkInputValidity(nameInput);
            checkInputValidity(surnameInput);
            checkInputValidity(studNoInput);
            checkInputValidity(deptInput);
            checkInputValidity(cityInput);
            checkInputValidity(start);
            return;
        }

        const student = {
            fname: nameInput.value,
            lname: surnameInput.value,
            num: studNoInput.value,
            dept: deptInput.value,
            pob: nameInput.value,
            dob: start.value
        };

        if (id) {
            await updateStudent(student);
        } else {
            await addStudent(student);
        }

        formItems.forEach(el => el.classList.remove('is-valid'))
        form.reset();
        exampleModal.hide();
        renderAll();
    });

    async function updateStudent(student) {
        const response = await fetch(`http://localhost:3000/students/${id}`, {
            method: 'PUT',
            body: JSON.stringify(student),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    }

    async function addStudent(student) {
        const response = await fetch('http://localhost:3000/students', {
            method: 'POST',
            body: JSON.stringify(student),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    }

    async function getStudent(id) {
        const response = await fetch(`http://localhost:3000/students/${id}`);
        return response.json();
    }

    async function deleteStudent(id) {
        const response = await fetch(`http://localhost:3000/students/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    }

    async function getStudents() {
        const response = await fetch('http://localhost:3000/students');
        return response.json();
    }
})();


