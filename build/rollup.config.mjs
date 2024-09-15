import includePaths from 'rollup-plugin-includepaths';

export default {
    output: {
      sourcemap: true
    },
    plugins: [
      includePaths({
        paths: [
          '../lib'
         ]
      }),
      //typescript({ sourceMap: false })
    ]
};