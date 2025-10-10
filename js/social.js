// social.js - front-end hooks and dummy data with API placeholders

const API_BASE = '/api/social'; // backend hooks ready

async function fetchPosts() {
    // Placeholder for GET /api/social/posts
    // return fetch(`${API_BASE}/posts`).then(r=>r.json());
    return Promise.resolve(sampleData.posts);
}

async function fetchTrending() {
    // Calculate trending posts based on engagement (likes + comments)
    const posts = sampleData.posts.slice();
    posts.sort((a, b) => {
        const engagementA = a.likes + a.comments.length;
        const engagementB = b.likes + b.comments.length;
        return engagementB - engagementA;
    });
    return Promise.resolve(posts.slice(0, 5)); // Top 5 most engaged
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
    if (list.length === 0) {
        node.innerHTML = '<p style="color:#888;font-size:0.9rem;">No trending posts yet</p>';
        return;
    }
    list.forEach(post => {
        const engagement = post.likes + post.comments.length;
        const el = document.createElement('div');
        el.className = 'trending-post';
        el.style.cssText = 'padding:10px;border-bottom:1px solid #eee;cursor:pointer;';
        el.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                <img src="${post.user.avatar}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">
                <strong style="font-size:0.9rem;">${post.user.name}</strong>
            </div>
            <p style="margin:4px 0;font-size:0.9rem;color:#555;">${post.text ? (post.text.length > 60 ? post.text.substring(0, 60) + '...' : post.text) : 'Post with media'}</p>
            <div style="display:flex;gap:12px;font-size:0.85rem;color:#888;">
                <span><i class="fas fa-heart"></i> ${post.likes}</span>
                <span><i class="fas fa-comment"></i> ${post.comments.length}</span>
                <span><i class="fas fa-fire"></i> ${engagement} engagement</span>
            </div>
        `;
        node.appendChild(el);
    });
}

function renderMostEngaged(list) {
    const node = document.getElementById('engaged-list');
    if (!node) return; // Element doesn't exist anymore
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
        { 
            id:'p1', 
            user:{name:'Amina', avatar:'../assets/images/M.yobby.jpg'}, 
            text:'Harvest was good this week! #blessed', 
            media:null, 
            likes:8, 
            comments:[
                {id:'c1', text:'Congratulations! What crop?', user:{name:'John'}},
                {id:'c2', text:'Amazing! Keep up the good work', user:{name:'Mary'}},
                {id:'c3', text:'Blessings from Nakuru!', user:{name:'Peter'}}
            ] 
        },
        { 
            id:'p2', 
            user:{name:'Otieno', avatar:'../assets/images/M.yobby.jpg'}, 
            text:'Selling fresh tomatoes, inbox me.', 
            media:null, 
            likes:5, 
            comments:[
                {id:'c4', text:'How much per kg?', user:{name:'Sarah'}},
                {id:'c5', text:'I am interested!', user:{name:'James'}}
            ] 
        },
        { 
            id:'p3', 
            user:{name:'Grace', avatar:'../assets/images/M.yobby.jpg'}, 
            text:'Just bought a new tractor! Excited to increase productivity', 
            media:null, 
            likes:12, 
            comments:[
                {id:'c6', text:'That is great news!', user:{name:'David'}}
            ] 
        }
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
    const commentsContainer = document.getElementById('comments-'+id);
    const post = sampleData.posts.find(p => p.id === id);
    
    if (box.style.display === 'none') {
        box.style.display = 'flex';
        commentsContainer.style.display = 'block';
        
        // Render existing comments
        if (post && post.comments.length > 0) {
            commentsContainer.innerHTML = '';
            post.comments.forEach(comment => {
                const commentEl = document.createElement('div');
                commentEl.style.cssText = 'padding:8px;background:#f8f9fa;border-radius:6px;margin-bottom:6px;';
                commentEl.innerHTML = `
                    <strong style="font-size:0.9rem;">${comment.user.name}</strong>
                    <p style="margin:4px 0 0 0;font-size:0.9rem;">${comment.text}</p>
                `;
                commentsContainer.appendChild(commentEl);
            });
        } else {
            commentsContainer.innerHTML = '<p style="color:#888;font-size:0.85rem;padding:8px;">No comments yet. Be the first to comment!</p>';
        }
    } else {
        box.style.display = 'none';
        commentsContainer.style.display = 'none';
    }
}

async function submitComment(id) {
    const input = document.getElementById('comment-input-'+id);
    if (!input.value) return;
    await commentPost(id, input.value);
    input.value='';
    // Re-render posts and trending to update engagement
    renderPosts(sampleData.posts);
    renderTrending(await fetchTrending());
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
