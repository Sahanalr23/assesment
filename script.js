const githubApiUrl = 'https://api.github.com/users/johnpapa';
const repositoriesApiUrl = 'https://api.github.com/users/johnpapa/repos';
let currentPage = 1;
let repositoriesPerPage = 10;

// Functions
function fetchUserDetails() {
    $.get(githubApiUrl, function (userData) {
        //image and bio details
        $('#userImage').attr('src', userData.avatar_url);

        let bioHtml = `<p>${userData.bio}</p>`;

        if (userData.location) {
            bioHtml += `<p><strong>Location:</strong> ${userData.location}</p>`;
        }

        if (userData.blog) {
            bioHtml += `<p><strong>Blog:</strong> <a href="${userData.blog}" target="_blank">${userData.blog}</a></p>`;
        }

        $('#userBio').html(bioHtml);
    }).fail(function () {
        $('#userBio').text('Error fetching user details');
    });
}

function fetchRepositories() {
    const loader = $('#loader');
    const repositoriesDiv = $('#repositories');

    loader.show();
    repositoriesDiv.empty();

    const apiUrl = `${repositoriesApiUrl}?per_page=${repositoriesPerPage}&page=${currentPage}`;

    $.get(apiUrl, function (data, status, xhr) {
        loader.hide();

        if (status === 'success') {
            if (data.length > 0) {
                data.forEach(repository => {
                    const technologies = repository.language ? repository.language.split(',') : ['Not specified'];
                    
                    const repoHtml = `
                        <div class="repository">
                            <h4><a href="${repository.html_url}" target="_blank">${repository.name}</a></h4>
                            <p>${repository.description || 'No description available'}</p>
                            <p><strong></strong> ${technologies.map(tech => `<span class="tech">${tech.trim()}</span>`).join(', ')}</p>
                        </div>
                    `;
                    repositoriesDiv.append(repoHtml);
                });
            } else {
                repositoriesDiv.append('<div>No repositories found</div>');
            }

            // pagination UI
            const totalPages = parseInt(xhr.getResponseHeader('link').match(/&page=(\d+)>; rel="last"/)[1]);
            updatePaginationNumbers(totalPages);
            updatePaginationUI(totalPages);
        } else {
            repositoriesDiv.append('<div>Error fetching repositories</div>');
        }
    }).fail(function () {
        loader.hide();
        repositoriesDiv.append('<div>Error fetching repositories</div>');
    });
}

function changePerPage() {
    currentPage = 1;
    repositoriesPerPage = parseInt($('#perPage').val());
    fetchRepositories();
}

function updatePaginationNumbers(totalPages) {
    const paginationNumbers = $('#pagination-numbers');
    paginationNumbers.empty();

    for (let i = 1; i <= totalPages && i <= 9; i++) {
        const pageNumber = `<div class="pagination-number" onclick="changePage(${i})">${i}</div>`;
        paginationNumbers.append(pageNumber);
    }
}

function changePage(page) {
    currentPage = page;
    fetchRepositories();
}

function updatePaginationUI(totalPages) {
    const paginationBackward = $('#pagination-backward');
    const paginationForward = $('#pagination-forward');

    if (currentPage > 1) {
        paginationBackward.show();
        paginationBackward.off('click').click(function () {
            changePage(currentPage - 1);
        });
    } else {
        paginationBackward.hide();
    }

    if (currentPage < totalPages) {
        paginationForward.show();
        paginationForward.off('click').click(function () {
            changePage(currentPage + 1);
        });
    } else {
        paginationForward.hide();
    }
}

$(document).ready(function () {
    fetchUserDetails();
    fetchRepositories();
});
