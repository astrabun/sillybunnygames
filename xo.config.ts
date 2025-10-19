const config = {
	rules: {
		'unicorn/filename-case': [
			'error',
			{
				cases: {
					camelCase: true,
					kebabCase: true,
				},
			},
		],
		'unicorn/expiring-todo-comments': [
			'error',
			{
				allowWarningComments: false,
			},
		],
		'unicorn/prefer-export-from': 'off',
		'no-warning-comments': 'off',
	},
	ignores: [
		'src/db/index.ts',
	],
};

export default config;
