/**
 * Custom ESLint rule to enforce component wrapper usage
 * 
 * This rule prevents direct imports from @/components/ui/* for components
 * that have meaningful wrappers in @/components/*.
 * 
 * Why: Wrapper components ensure consistent styling, padding, and behavior.
 * Only components with actual wrappers (not just re-exports) are enforced.
 * 
 * To add a new enforced wrapper:
 * 1. Create the wrapper in src/components/
 * 2. Add the component name to wrappedComponents below
 * 3. Add the wrapper file to eslint.config.mjs exceptions
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct imports from @/components/ui/ for wrapped components',
      category: 'Best Practices',
    },
    fixable: 'code',
    messages: {
      noDirectUiImport: "Import from '{{wrapperPath}}' instead of '@/components/ui/{{component}}'. Wrapper ensures consistent styling.",
    },
    schema: [],
  },

  create(context) {
    // Only components with meaningful wrappers (not just re-exports)
    // Map: ui component name -> wrapper path
    const wrappedComponents = {
      'card': '@/components/content-card',
      // Add more as needed:
      // 'button': '@/components/button',
    };

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        
        if (typeof importPath === 'string' && importPath.startsWith('@/components/ui/')) {
          const component = importPath.replace('@/components/ui/', '');
          
          if (wrappedComponents[component]) {
            const wrapperPath = wrappedComponents[component];
            
            context.report({
              node: node.source,
              messageId: 'noDirectUiImport',
              data: { component, wrapperPath },
              fix(fixer) {
                return fixer.replaceText(node.source, `'${wrapperPath}'`);
              },
            });
          }
        }
      },
    };
  },
};
