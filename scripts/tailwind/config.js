tailwind.config = {
      theme: {
        extend: {
          colors: {
            cream: '#FFF8F0',
            warm: '#FDF3E7',
            coral: '#FF6B5E',
            teal: '#5E9B9A',
            navy: '#2B3A42',
            softblue: '#6C8EBF',
            softyellow: '#F4C542',
            softgreen: '#6BAF7B',
            softred: '#E05D5D',
            softpurple: '#9B7EBD',
            warn: '#ffa364'
          },
          fontFamily: {
            display: ['"Fredoka One"', 'cursive', 'sans-serif'],
            body: ['"Nunito"', 'sans-serif'],
          },
          animation: {
            'float': 'float 6s ease-in-out infinite',
            'float-slow': 'float 8s ease-in-out infinite',
            'float-fast': 'float 4s ease-in-out infinite',
            'fade-up': 'fadeUp 0.8s ease-out forwards',
            'pop': 'pop 0.4s ease-out',
            'gentle-bounce': 'gentleBounce 1.5s infinite',
          },
          keyframes: {
            float: {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(3deg)' },
            },
            fadeUp: {
              '0%': { opacity: '0', transform: 'translateY(24px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            pop: {
              '0%': { transform: 'scale(0.95)' },
              '50%': { transform: 'scale(1.03)' },
              '100%': { transform: 'scale(1)' },
            },
            gentleBounce: {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-6px)' },
            },
          },
        },
      },
    };