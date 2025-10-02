// social.js - front-end hooks and dummy data with API placeholders

const API_BASE = '/api/social'; // backend hooks ready

async function fetchPosts() {
    // Placeholder for GET /api/social/posts
    // return fetch(`${API_BASE}/posts`).then(r=>r.json());
    return Promise.resolve(sampleData.posts);
}

async function fetchTrending() {
    // Placeholder for GET /api/social/trending
    return Promise.resolve(sampleData.trending);
}

async function fetchMostEngaged() {
    // Placeholder for GET /api/social/most-engaged
    return Promise.resolve(sampleData.mostEngaged);
}

async function createPost(formData) {
    // Placeholder for POST /api/social/create
    // return fetch(`${API_BASE}/create`, { method:'POST', body: formData });
    const newPost = {
        id: 'p' + Date.now(),
        user: { name: 'You', avatar: '../assets/images/M.yobby.jpg' },
        text: formData.get('text'),
        media: formData.get('media') ? URL.createObjectURL(formData.get('media')) : null,
        likes: 0,
        comments: []
    };
    sampleData.posts.unshift(newPost);
    return Promise.resolve(newPost);
}

async function likePost(id) {
    // Placeholder for POST /api/social/like/:id
    // return fetch(`${API_BASE}/like/${id}`, { method:'POST' });
    const p = sampleData.posts.find(x=>x.id===id);
    if (p) p.likes++;
    return Promise.resolve(p);
}

async function commentPost(id, comment) {
    // Placeholder for POST /api/social/comment/:id
    const p = sampleData.posts.find(x=>x.id===id);
    if (p) p.comments.push({ id:'c'+Date.now(), text:comment, user:{name:'Commenter'} });
    return Promise.resolve(p);
}

function renderPosts(posts) {
    const feed = document.getElementById('posts-feed');
    feed.innerHTML = '';
    posts.forEach(p => {
        const el = document.createElement('div');
        el.className = 'post card';
        el.innerHTML = `
            <div class="meta">
                <img src="${p.user.avatar}" alt="avatar">
                <div><strong>${p.user.name}</strong><div class="time">just now</div></div>
            </div>
            <div class="content">
                <p>${p.text || ''}</p>
                ${p.media ? (p.media.includes('video') ? `<video controls src="${p.media}" style="max-width:100%"></video>` : `<img src="${p.media}" style="max-width:100%">`) : ''}
            </div>
            <div class="actions">
                <button onclick="handleLike('${p.id}')">Like (${p.likes})</button>
                <button onclick="toggleCommentBox('${p.id}')">Comment (${p.comments.length})</button>
                <button onclick="handleShare('${p.id}')">Share</button>
            </div>
            <div class="comments" id="comments-${p.id}" style="display:none; margin-top:10px;"></div>
            <div class="comment-box" id="comment-box-${p.id}" style="display:none; margin-top:8px;">
                <input type="text" id="comment-input-${p.id}" placeholder="Write a comment...">
                <button onclick="submitComment('${p.id}')">Send</button>
            </div>
        `;
        feed.appendChild(el);
    });
}

function renderTrending(list) {
    const node = document.getElementById('trending-list');
    node.innerHTML = '';
    list.forEach(t => {
        const el = document.createElement('div');
        el.className = 'card';
        el.style.marginBottom='10px';
        el.innerHTML = `<strong>${t.title}</strong><p>${t.excerpt}</p>`;
        node.appendChild(el);
    });
}

function renderMostEngaged(list) {
    const node = document.getElementById('engaged-list');
    node.innerHTML = '';
    list.forEach(u => {
        const li = document.createElement('li');
        li.innerHTML = `<img src="${u.avatar}" style="width:40px;height:40px;border-radius:50%"><div><strong>${u.name}</strong><div>Score: ${u.score}</div></div>`;
        node.appendChild(li);
    });
}

// sample data (dummy)
const sampleData = {
    posts: [
        { id:'p1', user:{name:'Amina', avatar:'../assets/images/M.yobby.jpg'}, text:'Harvest was good this week! #blessed', media:null, likes:5, comments:[] },
        { id:'p2', user:{name:'Otieno', avatar:'../assets/images/M.yobby.jpg'}, text:'Selling fresh tomatoes, inbox me.', media:null, likes:3, comments:[] }
    ],
    trending: [
        { id:'t1', title:'Maize prices spike', excerpt:'Local maize prices rose 12% this week.'},
        { id:'t2', title:'New pest reported', excerpt:'Farmers report a new pest affecting beans.'}
    ],
    mostEngaged:[
        { id:'u1', name:'Amina', avatar:'../assets/images/M.yobby.jpg', score: 142 },
        { id:'u2', name:'Otieno', avatar:'../assets/images/M.yobby.jpg', score: 101 }
    ]
};

// UI handlers
async function initSocial() {
    const posts = await fetchPosts();
    renderPosts(posts);
    renderTrending(await fetchTrending());
    renderMostEngaged(await fetchMostEngaged());
}

async function handleLike(id) {
    await likePost(id);
    renderPosts(sampleData.posts);
}

function toggleCommentBox(id) {
    const box = document.getElementById('comment-box-'+id);
    const comments = document.getElementById('comments-'+id);
    if (box.style.display === 'none') {
        box.style.display = 'block';
        comments.style.display = 'block';
    } else {
        box.style.display = 'none';
        comments.style.display = 'none';
    }
}

async function submitComment(id) {
    const input = document.getElementById('comment-input-'+id);
    if (!input.value) return;
    await commentPost(id, input.value);
    input.value='';
    renderPosts(sampleData.posts);
}

function handleShare(id) {
    // placeholder for share behavior (POST /api/social/share/:id)
    alert('Share link copied to clipboard (placeholder)');
}

// form handling
document.addEventListener('DOMContentLoaded', ()=>{
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', async (e)=>{
            e.preventDefault();
            const text = document.getElementById('post-text').value;
            const mediaInput = document.getElementById('post-media');
            const fd = new FormData();
            fd.append('text', text);
            if (mediaInput.files[0]) fd.append('media', mediaInput.files[0]);
            await createPost(fd);
            document.getElementById('post-text').value='';
            if (mediaInput) mediaInput.value='';
            renderPosts(sampleData.posts);
        });
    }
    // init page content
    if (window.location.pathname.endsWith('social.html') || window.location.href.includes('social.html')) {
        initSocial();
    }
});
