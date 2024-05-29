source "https://rubygems.org"

git_source(:github) { |repo_name| "https://github.com/#{repo_name}" }

# Specify your gem's dependencies in simple_discussion.gemspec
gemspec

gem "standardrb"

gem "devise"
gem "puma"
gem "sqlite3"

group :development, :test do
  # Adds support for debug
  gem "debug"
  gem "erb_lint", require: false
  gem "rspec-rails", '~> 6.0'
  gem "rubocop-performance", require: false
  gem "rubocop-rails", require: false
  gem "rubocop-rspec", require: false
  gem "solargraph-rails", '~> 0.3.1'
  gem "appraisal"
end
