// Một số bài hát có thể bị lỗi do liên kết bị hỏng. Vui lòng thay thế liên kết khác để có thể phát
// Some songs may be faulty due to broken links. Please replace another link so that it can be played

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PlAYER_STORAGE_KEY = 'VUONG_HUU_LE'

const player = $('.player')
const playlist = $('.playlist');
const heading = $('header h2');
const cd = $('.cd');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const dashboardElement = $('.control');

const app = {
    currentIndex: 0,
    isPlaying : false,
    isRandom : false,
    isRepeat : false,
    a: true,
    config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [        
        {
        name: "Nang Tho",
        singer: "Raftaar x Fortnite",
        path: "mp3/NangTho-HoangDung-6413381.mp3",
        image: "img/hoang-dung.jpg"
        },
        {
        name: "Yeu Duoi",
        singer: "Raftaar x Salim Merchant x Karma",
        path: "mp3/YeuDuoiLiveAtHoiDongHoi--6889794.mp3",
        image: "img/hoang-dung.jpg"
        },
        {
        name: "Vi Anh Van",
        singer: "Raftaar x Brobha V",
        path:
            "mp3/ViAnhVanLiveAtHoiDongHoi--6889790.mp3",
        image: "img/hoang-dung.jpg"
        },
        {
        name: "Doi loi tinh ca",
        singer: "Hoàng Dũng",
        path: "mp3/DoiLoiTinhCaLiveAtHoiDongHoi--6889784.mp3",
        image:
            "img/hoang-dung.jpg"
        },
        {
            name: "Viên Đá Nhỏ",
            singer: "Hải Băng",
            path: "mp3/Vien-Da-Nho-Hai-Bang.mp3",
            image:
                "img/hai-bang.jpg"
        },
        {
            name: "Bỗng dưng muốn khóc",
            singer: "Minh Thư",
            path: "mp3/Bong-Dung-Muon-Khoc-Minh-Thu.mp3",
            image:
                "img/minh-thu.jpg"
        },
        {
            name: "Cảm giác bên anh",
            singer: "Hải Băng",
            path: "mp3/Cam-Giac-Ben-Anh-Hai-Bang.mp3",
            image:
                "img/hai-bang.jpg"
        },
    ],
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return  `<div class="song ${index === this.currentIndex ? 'active': ''}"data-i= "${index}">
                        <div class="thumb" style="background-image: url('${song.image}')">
                        </div>
                        <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>`
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handlEvents: function() {
        const _this = this;   
        const cdWidth = cd.offsetWidth;

        // Xử lý phóng to hoặc thu nhỏ cd
        document.onscroll = function (a) {
            if(a) {
                const scrollTop = document.documentElement.scrollTop || window.scrollY;
                const newcdWidth = cdWidth - scrollTop;
                cd.style.opacity = newcdWidth / cdWidth;
                cd.style.width = newcdWidth > 0 ? newcdWidth + 'px': 0;
            }
        }
        
        

        // Xử lý cd quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform : 'rotate(360deg)',}
        ], {
            duration: 10000, //10seconds
            iterations: Infinity,
        })
        cdThumbAnimate.pause();
        
        //Xử lý khi click play
        playBtn.onclick = function() {
            if(_this.isPlaying) {
                audio.pause()
            } else {
                audio.play();
            }
        }

        // Khi bài hát được play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }
        //Khi bài hát được pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
            progress.value = progressPercent;
        }

        //Xử lý khi tua bài hát
        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime;
        }

        //Khi thực hiện next
        nextBtn.onclick = function() {
            
            if(_this.isRandom) {
                _this.randomSong();
            } else 
            {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        },
            
            

        //Khi thực hiện prev
        prevBtn.onclick = function() {
            if(_this.isRandom) {
                _this.randomSong();
            } else 
            {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        //khi tác động nút ramdom bài hát
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        //Xử lý next bài hát khi audio ended
        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        //Xử lý lặp lại 1 bài hát khi ấn repeat
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Lắng nghe hành vi click vào playlists
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            const optionNode = e.target.closest('.option')
            console.log(songNode,optionNode);
            //Xử lý khi click vào bài hát
            if(songNode|| optionNode) {
                //Xử lý khi click vào bài hát
                if(songNode) {
                    _this.currentIndex = Number(songNode.dataset.i)
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }
            }
        }
    },

    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`
        audio.src = this.currentSong.path
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    nextSong: function() {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length -1;
        }
        this.loadCurrentSong()
    },
    randomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (this.currentIndex === newIndex )
        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },

    scrollToActiveSong: function() {
        setTimeout( () => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end', 
            });
        },  200)
    },

    start: function() {

        this.loadConfig()
        //Định nghĩa các thuộc tính cho objec
        this.defineProperties()

        //Lắng nghe xử lý các sự kiện (DOM Events)
        this.handlEvents()

        //Tải thông tin bài hát đầu tiện vào UI khi chạy ứng dụng
        this.loadCurrentSong()
        //Render playlists
        this.render()

        repeatBtn.classList.toggle('active', this.isRepeat)
        randomBtn.classList.toggle('active', this.isRandom)

    }
}

app.start();

