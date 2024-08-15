module ApplicationHelper
  # simple sql query implementation of basic_search, this helper method can be complex as it you wanted it to be
  def topic_search(query)
    ForumThread.joins(:forum_posts)
               .where("forum_threads.title LIKE :query OR forum_posts.body LIKE :query", query: "%#{query}%")
               .distinct
  end
end
