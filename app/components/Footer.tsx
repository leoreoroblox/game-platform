'use client';

export default function Footer() {
  const links = [
    'About Us', 'Careers', 'Newsroom', 'Parents', 
    'Gift Cards', 'Support', 'Terms', 'Accessibility', 
    'Privacy', 'Your Privacy Choices', 'Sitemap'
  ];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    alert('Coming soon!');
  };

  return (
    <footer className="w-full bg-gray-950 border-t border-gray-800 py-8 mt-20 text-xs text-gray-500">
      <div className="max-w-7xl mx-auto px-8 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
          {links.map((link) => (
            <button 
              key={link} 
              onClick={handleClick}
              className="hover:text-white transition"
            >
              {link}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-gray-600">
          <span>Language: English</span>
          <span>© 2026 Leo Game Corporation</span>
        </div>
      </div>
    </footer>
  );
}