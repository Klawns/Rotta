import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Rotta',
        short_name: 'Rotta',
        description: 'A elite do gerenciamento para entregadores profissionais.',
        start_url: '/',
        display: 'standalone',
        background_color: '#020617',
        theme_color: '#020617',
        scope: '/',
        icons: [
            {
                src: '/assets/logo8.jpg',
                sizes: 'any',
                type: 'image/jpeg',
            },
            {
                src: '/assets/logo8.jpg',
                sizes: '192x192',
                type: 'image/jpeg',
                purpose: 'maskable',
            },
            {
                src: '/assets/logo8.jpg',
                sizes: '512x512',
                type: 'image/jpeg',
            },
        ],
    }
}
