const Footer = () => {
  return (
    <footer className="border-t py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        &copy; {new Date().getFullYear()} Olympus. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default Footer;
