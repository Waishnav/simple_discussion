require "test_helper"

class ForumTest < ActionDispatch::IntegrationTest
  include ActionView::RecordIdentifier
  include SimpleDiscussion::Engine.routes.url_helpers

  setup do
    sign_in users(:one)
    @filter = LanguageFilter::Filter.new
  end

  test "threads index" do
    get "/"
    assert_response :success
    assert_match "Community", response.body
  end

  test "categories" do
    get forum_category_forum_threads_path(forum_categories(:general))
    assert_response :success
  end

  test "show forum thread" do
    get forum_thread_path(forum_threads(:hello))
    assert_response :success
  end

  test "create a forum thread" do
    assert_difference "ForumThread.count" do
      assert_difference "ForumPost.count" do
        post forum_threads_path, params: {
          forum_thread: {
            forum_category_id: forum_categories(:general).id,
            title: "Test Thread",
            forum_posts_attributes: [{
              body: "Hello test thread"
            }]
          }
        }
      end
    end

    assert_redirected_to forum_thread_path(ForumThread.last)
  end

  test "reply to a forum thread" do
    assert_difference "ForumPost.count" do
      post forum_thread_forum_posts_path(forum_threads(:hello)), params: {
        forum_post: {
          body: "Reply"
        }
      }
    end

    assert_redirected_to forum_thread_path(forum_threads(:hello), anchor: dom_id(ForumPost.last))
  end

  test "cannot create a forum thread with inappropriate language in title" do
    inappropriate_word = @filter.matchlist.to_a.sample
    assert_no_difference "ForumThread.count" do
      assert_no_difference "ForumPost.count" do
        post forum_threads_path, params: {
          forum_thread: {
            forum_category_id: forum_categories(:general).id,
            title: "This title contains inappropriate language: #{inappropriate_word}",
            forum_posts_attributes: [{
              body: "Clean body"
            }]
          }
        }
      end
    end

    assert_response :unprocessable_entity
    assert_includes response.body, "Title contains inappropriate language"
  end

  test "cannot create a forum thread with inappropriate language in body" do
    inappropriate_word = @filter.matchlist.to_a.sample
    assert_no_difference "ForumThread.count" do
      assert_no_difference "ForumPost.count" do
        post forum_threads_path, params: {
          forum_thread: {
            forum_category_id: forum_categories(:general).id,
            title: "Clean Title",
            forum_posts_attributes: [{
              body: "This post contains inappropriate language: #{inappropriate_word}"
            }]
          }
        }
      end
    end

    assert_response :unprocessable_entity
    assert_includes response.body, "Body contains inappropriate language"
  end

  test "cannot reply to a forum thread with inappropriate language" do
    inappropriate_word = @filter.matchlist.to_a.sample
    assert_no_difference "ForumPost.count" do
      post forum_thread_forum_posts_path(forum_threads(:hello)), params: {
        forum_post: {
          body: "This reply contains inappropriate language: #{inappropriate_word}"
        }
      }
    end

    assert_response :unprocessable_entity
    assert_includes response.body, "Body contains inappropriate language"
  end

  test "can create a forum thread with appropriate language in title and body" do
    assert_difference "ForumThread.count" do
      assert_difference "ForumPost.count" do
        post forum_threads_path, params: {
          forum_thread: {
            forum_category_id: forum_categories(:general).id,
            title: "Clean Thread Title",
            forum_posts_attributes: [{
              body: "This is a clean and appropriate post."
            }]
          }
        }
      end
    end

    assert_redirected_to forum_thread_path(ForumThread.last)
  end
end
