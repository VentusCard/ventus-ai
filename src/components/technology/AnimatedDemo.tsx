interface AnimatedDemoProps {
  htmlContent: string;
  animationDelay?: string;
}

const AnimatedDemo = ({ htmlContent, animationDelay = '0.45s' }: AnimatedDemoProps) => {
  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <h2
          className="text-2xl font-semibold text-foreground mb-8 animate-fade-float"
          style={{ animationDelay, animationFillMode: 'backwards' }}
        >
          See It In Action
        </h2>
        <div
          className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm overflow-hidden animate-fade-float"
          style={{
            animationDelay: `calc(${animationDelay} + 0.1s)`,
            animationFillMode: 'backwards',
            isolation: 'isolate',
          }}
        >
          <div
            className="animated-demo-scope"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </section>
  );
};

export default AnimatedDemo;
